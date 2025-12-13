"""
Payment service for Stripe integration
"""

import stripe
import os
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from database import EventModel, EventRegistrationModel, CalendarModel
from decouple import config
import uuid

# Stripe configuration
stripe.api_key = config('STRIPE_SECRET_KEY', default='sk_test_placeholder')
STRIPE_WEBHOOK_SECRET = config('STRIPE_WEBHOOK_SECRET', default='')

class PaymentService:
    """Service for handling Stripe payments"""
    
    def __init__(self):
        self.stripe_available = stripe.api_key != 'sk_test_placeholder'
    
    def create_payment_intent(
        self,
        amount_cents: int,
        currency: str,
        event_id: str,
        user_id: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Create a Stripe payment intent"""
        if not self.stripe_available:
            raise ValueError("Stripe is not configured")
        
        payment_metadata = {
            'event_id': event_id,
            'user_id': user_id,
            **(metadata or {})
        }
        
        try:
            intent = stripe.PaymentIntent.create(
                amount=amount_cents,
                currency=currency.lower(),
                metadata=payment_metadata,
                automatic_payment_methods={
                    'enabled': True,
                },
            )
            
            return {
                'client_secret': intent.client_secret,
                'payment_intent_id': intent.id,
                'status': intent.status
            }
        except stripe.error.StripeError as e:
            raise ValueError(f"Stripe error: {str(e)}")
    
    def confirm_payment(self, payment_intent_id: str) -> Dict[str, Any]:
        """Confirm a payment intent"""
        if not self.stripe_available:
            raise ValueError("Stripe is not configured")
        
        try:
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            return {
                'id': intent.id,
                'status': intent.status,
                'amount': intent.amount,
                'currency': intent.currency,
                'metadata': intent.metadata
            }
        except stripe.error.StripeError as e:
            raise ValueError(f"Stripe error: {str(e)}")
    
    def create_refund(
        self,
        payment_intent_id: str,
        amount_cents: Optional[int] = None,
        reason: str = "requested_by_customer"
    ) -> Dict[str, Any]:
        """Create a refund for a payment"""
        if not self.stripe_available:
            raise ValueError("Stripe is not configured")
        
        try:
            refund_params = {
                'payment_intent': payment_intent_id,
                'reason': reason
            }
            if amount_cents:
                refund_params['amount'] = amount_cents
            
            refund = stripe.Refund.create(**refund_params)
            
            return {
                'id': refund.id,
                'status': refund.status,
                'amount': refund.amount,
                'currency': refund.currency
            }
        except stripe.error.StripeError as e:
            raise ValueError(f"Stripe error: {str(e)}")
    
    def create_calendar_plus_subscription(
        self,
        customer_id: str,
        price_id: str,
        calendar_id: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Create a Calendar Plus subscription"""
        if not self.stripe_available:
            raise ValueError("Stripe is not configured")
        
        subscription_metadata = {
            'calendar_id': calendar_id,
            'type': 'calendar_plus',
            **(metadata or {})
        }
        
        try:
            subscription = stripe.Subscription.create(
                customer=customer_id,
                items=[{'price': price_id}],
                metadata=subscription_metadata,
            )
            
            return {
                'subscription_id': subscription.id,
                'status': subscription.status,
                'current_period_end': subscription.current_period_end,
                'customer_id': subscription.customer
            }
        except stripe.error.StripeError as e:
            raise ValueError(f"Stripe error: {str(e)}")
    
    def cancel_subscription(self, subscription_id: str) -> Dict[str, Any]:
        """Cancel a Calendar Plus subscription"""
        if not self.stripe_available:
            raise ValueError("Stripe is not configured")
        
        try:
            subscription = stripe.Subscription.modify(
                subscription_id,
                cancel_at_period_end=True
            )
            
            return {
                'subscription_id': subscription.id,
                'status': subscription.status,
                'cancel_at_period_end': subscription.cancel_at_period_end
            }
        except stripe.error.StripeError as e:
            raise ValueError(f"Stripe error: {str(e)}")
    
    def get_subscription(self, subscription_id: str) -> Dict[str, Any]:
        """Get subscription details"""
        if not self.stripe_available:
            raise ValueError("Stripe is not configured")
        
        try:
            subscription = stripe.Subscription.retrieve(subscription_id)
            return {
                'subscription_id': subscription.id,
                'status': subscription.status,
                'current_period_end': subscription.current_period_end,
                'cancel_at_period_end': subscription.cancel_at_period_end
            }
        except stripe.error.StripeError as e:
            raise ValueError(f"Stripe error: {str(e)}")

