"""Payment endpoints using Stripe"""
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.api.auth import get_current_user
import stripe
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")


@router.get("/validate-promo")
async def validate_promo_code(
    promo_code: str,
    db: Session = Depends(get_db)
):
    """Validate a promo code"""
    from datetime import datetime
    
    promo = db.query(models.PromoCode).filter(
        models.PromoCode.code == promo_code.upper()
    ).first()
    
    if not promo:
        raise HTTPException(status_code=404, detail="Invalid promo code")
    
    if not promo.is_active:
        raise HTTPException(status_code=400, detail="Promo code is no longer active")
    
    if promo.max_uses and promo.current_uses >= promo.max_uses:
        raise HTTPException(status_code=400, detail="Promo code has reached maximum uses")
    
    if promo.expires_at and promo.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Promo code has expired")
    
    return {
        "valid": True,
        "discount_percent": promo.discount_percent,
        "description": promo.description
    }


@router.post("/create-checkout-session")
async def create_checkout_session(
    session_data: schemas.SessionCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a Stripe checkout session for booking"""
    try:
        print(f"Creating checkout session for user {current_user.id}")
        print(f"Session data: {session_data}")
        
        # Get mentor
        mentor = db.query(models.Mentor).filter(
            models.Mentor.id == session_data.mentor_id
        ).first()
        
        if not mentor:
            raise HTTPException(status_code=404, detail="Mentor not found")
        
        if not mentor.is_available:
            raise HTTPException(status_code=400, detail="Mentor is not available")
        
        # Calculate price
        price = mentor.hourly_rate * (session_data.duration_minutes / 60)
        
        # Apply promo code if provided
        from datetime import datetime
        discount_percent = 0
        if hasattr(session_data, 'promo_code') and session_data.promo_code:
            promo = db.query(models.PromoCode).filter(
                models.PromoCode.code == session_data.promo_code.upper(),
                models.PromoCode.is_active == True
            ).first()
            
            if promo:
                if not promo.max_uses or promo.current_uses < promo.max_uses:
                    if not promo.expires_at or promo.expires_at > datetime.utcnow():
                        discount_percent = promo.discount_percent
                        price = price * (1 - discount_percent / 100)
                        promo.current_uses += 1
                        db.commit()
        
        print(f"Calculated price: ${price} (discount: {discount_percent}%)")
        
        # Create the session in database immediately (before Stripe checkout)
        # This ensures the session exists even if webhook fails
        db_session = models.Session(
            student_id=current_user.id,
            mentor_id=session_data.mentor_id,
            title=session_data.title,
            description=session_data.description,
            scheduled_at=session_data.scheduled_at,
            duration_minutes=session_data.duration_minutes,
            price=price,
            payment_status='pending',
            status='pending'
        )
        db.add(db_session)
        db.commit()
        db.refresh(db_session)
        
        print(f"Created session {db_session.id} with pending status")
        
        # Create Stripe checkout session
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'unit_amount': int(price * 100),  # Convert to cents
                    'product_data': {
                        'name': f'Mentorship Session with {mentor.title}',
                        'description': f'{session_data.duration_minutes} minutes session',
                    },
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=f'{os.getenv("FRONTEND_URL", "http://localhost:3001")}/sessions/success?session_id={{CHECKOUT_SESSION_ID}}',
            cancel_url=f'{os.getenv("FRONTEND_URL", "http://localhost:3001")}/mentors/{mentor.id}?canceled=true',
            metadata={
                'user_id': current_user.id,
                'mentor_id': mentor.id,
                'session_id': db_session.id,
                'title': session_data.title,
                'description': session_data.description,
                'scheduled_at': str(session_data.scheduled_at),
                'duration_minutes': session_data.duration_minutes,
            }
        )
        
        print(f"Checkout session created: {checkout_session.id}")
        
        return {
            "checkout_url": checkout_session.url,
            "session_id": checkout_session.id
        }
        
    except stripe.error.StripeError as e:
        print(f"Stripe error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Error creating checkout session: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """Handle Stripe webhook events"""
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Handle the checkout.session.completed event
    if event['type'] == 'checkout.session.completed':
        try:
            session = event['data']['object']
            metadata = session['metadata']
            
            print(f"Processing webhook for checkout session: {session['id']}")
            print(f"Metadata: {metadata}")
            
            # Try to find existing session by session_id in metadata
            db_session = None
            if 'session_id' in metadata and metadata['session_id']:
                session_id = int(metadata['session_id'])
                db_session = db.query(models.Session).filter(
                    models.Session.id == session_id
                ).first()
                print(f"Found existing session: {db_session.id if db_session else 'None'}")
            
            if db_session:
                # Update existing session
                print(f"Updating session {db_session.id} to paid status")
                db_session.payment_status = 'paid'
                db_session.status = 'scheduled'
                db_session.stripe_payment_id = session.get('payment_intent')
                db_session.price = session['amount_total'] / 100
            else:
                # Fallback: Create new session if not found
                print("Creating new session from webhook")
                db_session = models.Session(
                    student_id=int(metadata['user_id']),
                    mentor_id=int(metadata['mentor_id']),
                    title=metadata['title'],
                    description=metadata.get('description', ''),
                    scheduled_at=metadata['scheduled_at'],
                    duration_minutes=int(metadata['duration_minutes']),
                    price=session['amount_total'] / 100,
                    payment_status='paid',
                    status='scheduled',
                    stripe_payment_id=session.get('payment_intent')
                )
                db.add(db_session)
            
            # Note: total_sessions will be incremented when session is marked as completed
            # not when payment is received
            
            db.commit()
            db.refresh(db_session)
            
            print(f"Session {db_session.id} saved successfully")
            
            # Get user and mentor emails
            user = db.query(models.User).filter(
                models.User.id == int(metadata['user_id'])
            ).first()
            
            mentor_user = db.query(models.User).filter(
                models.User.id == mentor.user_id
            ).first() if mentor else None
            
            # Send confirmation email with calendar invite to both mentee and mentor
            if user and mentor and mentor_user:
                print(f"Sending confirmation emails to {user.email} and {mentor_user.email}")
                from app.utils.email import send_session_confirmation_email
                send_session_confirmation_email(
                    user.email,
                    mentor_user.email,
                    {
                        'id': db_session.id,
                        'title': metadata['title'],
                        'description': metadata.get('description', ''),
                        'scheduled_at': metadata['scheduled_at'],
                        'duration_minutes': int(metadata['duration_minutes']),
                        'price': session['amount_total'] / 100,
                        'mentor_name': mentor_user.full_name,
                        'mentor_title': mentor.title
                    }
                )
            
            return {"status": "success"}
            
        except Exception as e:
            print(f"Error processing webhook: {str(e)}")
            import traceback
            traceback.print_exc()
            db.rollback()
            raise HTTPException(status_code=500, detail=str(e))
    
    return {"status": "success"}


@router.get("/config")
async def get_stripe_config():
    """Get Stripe publishable key"""
    return {
        "publishable_key": os.getenv("STRIPE_PUBLISHABLE_KEY")
    }
