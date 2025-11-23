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
        print(f"Calculated price: ${price}")
        
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
            success_url=f'http://localhost:3002/sessions/success?session_id={{CHECKOUT_SESSION_ID}}',
            cancel_url=f'http://localhost:3002/mentors/{mentor.id}?canceled=true',
            metadata={
                'user_id': current_user.id,
                'mentor_id': mentor.id,
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
        session = event['data']['object']
        
        # Create the mentorship session in database
        metadata = session['metadata']
        db_session = models.Session(
            student_id=int(metadata['user_id']),
            mentor_id=int(metadata['mentor_id']),
            title=metadata['title'],
            description=metadata['description'],
            scheduled_at=metadata['scheduled_at'],
            duration_minutes=int(metadata['duration_minutes']),
            price=session['amount_total'] / 100,  # Convert from cents
            payment_status='paid',
            stripe_payment_id=session['payment_intent']
        )
        db.add(db_session)
        
        # Update mentor stats
        mentor = db.query(models.Mentor).filter(
            models.Mentor.id == int(metadata['mentor_id'])
        ).first()
        if mentor:
            mentor.total_sessions += 1
        
        db.commit()
        db.refresh(db_session)
        
        # Get user email
        user = db.query(models.User).filter(
            models.User.id == int(metadata['user_id'])
        ).first()
        
        # Send confirmation email with calendar invite
        if user and mentor:
            from app.utils.email import send_session_confirmation_email
            send_session_confirmation_email(
                user.email,
                {
                    'id': db_session.id,
                    'title': metadata['title'],
                    'description': metadata['description'],
                    'scheduled_at': metadata['scheduled_at'],
                    'duration_minutes': int(metadata['duration_minutes']),
                    'price': session['amount_total'] / 100,
                    'mentor_title': mentor.title
                }
            )
    
    return {"status": "success"}


@router.get("/config")
async def get_stripe_config():
    """Get Stripe publishable key"""
    return {
        "publishable_key": os.getenv("STRIPE_PUBLISHABLE_KEY")
    }
