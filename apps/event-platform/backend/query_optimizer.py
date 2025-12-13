"""
Database query optimization utilities and patterns
"""

from sqlalchemy import text, func, and_, or_, select, update, delete
from sqlalchemy.orm import Session, selectinload, joinedload, contains_eager
from sqlalchemy.sql import Select
from typing import List, Dict, Any, Optional, Union, Type
from datetime import datetime, timedelta
import logging
from functools import wraps

from database import (
    UserModel, CalendarModel, EventModel, EventRegistrationModel,
    CalendarSubscriptionModel, CalendarPermissionModel, NotificationModel
)
from cache_service import cache, cached, CacheTTL

logger = logging.getLogger(__name__)

class QueryOptimizer:
    """Database query optimization utilities"""
    
    @staticmethod
    def add_pagination(query: Select, skip: int = 0, limit: int = 100) -> Select:
        """Add pagination to query with bounds checking"""
        # Ensure reasonable limits
        limit = min(limit, 1000)  # Max 1000 items per page
        skip = max(skip, 0)       # No negative offsets
        
        return query.offset(skip).limit(limit)
    
    @staticmethod
    def add_ordering(query: Select, order_by: str = None, desc: bool = False) -> Select:
        """Add ordering to query with validation"""
        if not order_by:
            return query
        
        # Map of allowed order fields to actual columns
        order_mappings = {
            'created_at': 'created_at',
            'updated_at': 'updated_at',
            'name': 'name',
            'title': 'title',
            'start_time': 'start_time',
            'end_time': 'end_time',
            'joined_at': 'joined_at'
        }
        
        if order_by in order_mappings:
            column_name = order_mappings[order_by]
            if desc:
                return query.order_by(text(f"{column_name} DESC"))
            else:
                return query.order_by(text(column_name))
        
        return query
    
    @staticmethod
    def optimize_user_queries(query: Select) -> Select:
        """Optimize queries involving users"""
        # Avoid N+1 queries by eager loading commonly accessed relationships
        return query.options(
            selectinload(UserModel.owned_calendars),
            selectinload(UserModel.calendar_subscriptions)
        )
    
    @staticmethod
    def optimize_calendar_queries(query: Select) -> Select:
        """Optimize queries involving calendars"""
        return query.options(
            joinedload(CalendarModel.owner),
            selectinload(CalendarModel.permissions),
            selectinload(CalendarModel.subscriptions)
        )
    
    @staticmethod
    def optimize_event_queries(query: Select) -> Select:
        """Optimize queries involving events"""
        return query.options(
            joinedload(EventModel.calendar).joinedload(CalendarModel.owner),
            joinedload(EventModel.host),
            selectinload(EventModel.registrations)
        )
    
    @staticmethod
    def build_search_query(
        model: Type,
        search_term: str,
        search_fields: List[str]
    ) -> Select:
        """Build optimized full-text search query"""
        query = select(model)
        
        if not search_term or not search_fields:
            return query
        
        # Create search conditions
        search_conditions = []
        search_pattern = f"%{search_term.lower()}%"
        
        for field in search_fields:
            if hasattr(model, field):
                column = getattr(model, field)
                search_conditions.append(
                    func.lower(column).like(search_pattern)
                )
        
        if search_conditions:
            query = query.where(or_(*search_conditions))
        
        return query


# Optimized query functions with caching
class OptimizedQueries:
    """Collection of optimized database queries with caching"""
    
    @staticmethod
    @cached(ttl=CacheTTL.USER_PROFILE, key_prefix="user_profile")
    def get_user_with_profile(db: Session, user_id: str) -> Optional[UserModel]:
        """Get user with optimized profile loading"""
        return db.execute(
            select(UserModel)
            .where(UserModel.id == user_id)
            .options(
                selectinload(UserModel.owned_calendars),
                selectinload(UserModel.calendar_subscriptions)
            )
        ).scalar_one_or_none()
    
    @staticmethod
    @cached(ttl=CacheTTL.CALENDAR_INFO, key_prefix="calendar_full")
    def get_calendar_with_details(db: Session, calendar_id: str) -> Optional[CalendarModel]:
        """Get calendar with all related data optimized"""
        return db.execute(
            select(CalendarModel)
            .where(CalendarModel.id == calendar_id)
            .options(
                joinedload(CalendarModel.owner),
                selectinload(CalendarModel.permissions).joinedload(CalendarPermissionModel.user),
                selectinload(CalendarModel.events).options(
                    joinedload(EventModel.host),
                    selectinload(EventModel.registrations)
                )
            )
        ).scalar_one_or_none()
    
    @staticmethod
    @cached(ttl=CacheTTL.PUBLIC_CALENDARS, key_prefix="public_calendars")
    def get_public_calendars_optimized(
        db: Session, 
        skip: int = 0, 
        limit: int = 50
    ) -> List[CalendarModel]:
        """Get public calendars with optimized loading"""
        query = select(CalendarModel).where(
            CalendarModel.visibility == 'public'
        ).options(
            joinedload(CalendarModel.owner),
            selectinload(CalendarModel.subscriptions)
        ).order_by(CalendarModel.created_at.desc())
        
        query = QueryOptimizer.add_pagination(query, skip, limit)
        
        return db.execute(query).unique().scalars().all()
    
    @staticmethod
    @cached(ttl=CacheTTL.EVENT_DETAILS, key_prefix="event_full")
    def get_event_with_details(db: Session, event_id: str) -> Optional[EventModel]:
        """Get event with all related data optimized"""
        return db.execute(
            select(EventModel)
            .where(EventModel.id == event_id)
            .options(
                joinedload(EventModel.calendar).joinedload(CalendarModel.owner),
                joinedload(EventModel.host),
                selectinload(EventModel.registrations).joinedload(EventRegistrationModel.user)
            )
        ).scalar_one_or_none()
    
    @staticmethod
    @cached(ttl=CacheTTL.SEARCH_RESULTS, key_prefix="event_search")
    def search_events_optimized(
        db: Session,
        search_term: str = None,
        category: str = None,
        location: str = None,
        start_date: datetime = None,
        end_date: datetime = None,
        skip: int = 0,
        limit: int = 50
    ) -> List[EventModel]:
        """Optimized event search with multiple filters"""
        query = select(EventModel).where(
            EventModel.status == 'published',
            EventModel.visibility == 'public'
        ).options(
            joinedload(EventModel.calendar).joinedload(CalendarModel.owner),
            joinedload(EventModel.host)
        )
        
        # Add search filters
        conditions = []
        
        if search_term:
            search_pattern = f"%{search_term.lower()}%"
            conditions.append(
                or_(
                    func.lower(EventModel.title).like(search_pattern),
                    func.lower(EventModel.description).like(search_pattern)
                )
            )
        
        if category:
            conditions.append(EventModel.category == category)
        
        if location:
            location_pattern = f"%{location.lower()}%"
            conditions.append(
                or_(
                    func.lower(EventModel.location_address).like(location_pattern),
                    func.lower(EventModel.location_url).like(location_pattern)
                )
            )
        
        if start_date:
            conditions.append(EventModel.start_time >= start_date)
        
        if end_date:
            conditions.append(EventModel.start_time <= end_date)
        
        if conditions:
            query = query.where(and_(*conditions))
        
        # Order by start time
        query = query.order_by(EventModel.start_time.asc())
        
        # Add pagination
        query = QueryOptimizer.add_pagination(query, skip, limit)
        
        return db.execute(query).unique().scalars().all()
    
    @staticmethod
    @cached(ttl=CacheTTL.SUBSCRIPTION_COUNT, key_prefix="calendar_subscribers")
    def get_calendar_subscriber_count(db: Session, calendar_id: str) -> int:
        """Get calendar subscriber count with caching"""
        return db.execute(
            select(func.count(CalendarSubscriptionModel.id))
            .where(
                CalendarSubscriptionModel.calendar_id == calendar_id,
                CalendarSubscriptionModel.is_active == True
            )
        ).scalar() or 0
    
    @staticmethod
    @cached(ttl=CacheTTL.POPULAR_EVENTS, key_prefix="popular_events")
    def get_popular_events(
        db: Session,
        days_back: int = 30,
        skip: int = 0,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """Get popular events based on registration count"""
        cutoff_date = datetime.utcnow() - timedelta(days=days_back)
        
        # Subquery to count registrations per event
        registration_counts = (
            select(
                EventRegistrationModel.event_id,
                func.count(EventRegistrationModel.id).label('registration_count')
            )
            .where(
                EventRegistrationModel.status.in_(['confirmed', 'pending_approval']),
                EventRegistrationModel.created_at >= cutoff_date
            )
            .group_by(EventRegistrationModel.event_id)
            .subquery()
        )
        
        # Main query with registration counts
        query = (
            select(EventModel, registration_counts.c.registration_count)
            .join(registration_counts, EventModel.id == registration_counts.c.event_id)
            .where(
                EventModel.status == 'published',
                EventModel.visibility == 'public',
                EventModel.start_time >= datetime.utcnow()
            )
            .options(
                joinedload(EventModel.calendar).joinedload(CalendarModel.owner),
                joinedload(EventModel.host)
            )
            .order_by(registration_counts.c.registration_count.desc())
        )
        
        query = QueryOptimizer.add_pagination(query, skip, limit)
        
        results = db.execute(query).all()
        
        return [
            {
                'event': result[0],
                'registration_count': result[1] or 0
            }
            for result in results
        ]
    
    @staticmethod
    def get_user_dashboard_data(db: Session, user_id: str) -> Dict[str, Any]:
        """Get optimized dashboard data for user"""
        # Use a single query with subqueries for efficiency
        
        # User's upcoming events (as attendee)
        upcoming_events_query = (
            select(EventModel)
            .join(EventRegistrationModel)
            .where(
                EventRegistrationModel.user_id == user_id,
                EventRegistrationModel.status == 'confirmed',
                EventModel.start_time >= datetime.utcnow()
            )
            .options(
                joinedload(EventModel.calendar),
                joinedload(EventModel.host)
            )
            .order_by(EventModel.start_time.asc())
            .limit(10)
        )
        
        # User's hosted events
        hosted_events_query = (
            select(EventModel)
            .where(
                EventModel.host_user_id == user_id,
                EventModel.start_time >= datetime.utcnow()
            )
            .options(
                joinedload(EventModel.calendar),
                selectinload(EventModel.registrations)
            )
            .order_by(EventModel.start_time.asc())
            .limit(10)
        )
        
        # User's calendar subscriptions with recent events
        subscriptions_query = (
            select(CalendarSubscriptionModel)
            .where(
                CalendarSubscriptionModel.user_id == user_id,
                CalendarSubscriptionModel.is_active == True
            )
            .options(
                joinedload(CalendarSubscriptionModel.calendar).joinedload(CalendarModel.owner)
            )
            .limit(20)
        )
        
        upcoming_events = db.execute(upcoming_events_query).unique().scalars().all()
        hosted_events = db.execute(hosted_events_query).unique().scalars().all()
        subscriptions = db.execute(subscriptions_query).unique().scalars().all()
        
        return {
            'upcoming_events': upcoming_events,
            'hosted_events': hosted_events,
            'subscriptions': subscriptions
        }


# Bulk operations for better performance
class BulkOperations:
    """Optimized bulk database operations"""
    
    @staticmethod
    def bulk_create_notifications(
        db: Session,
        notifications_data: List[Dict[str, Any]]
    ) -> List[NotificationModel]:
        """Bulk create notifications efficiently"""
        notifications = [
            NotificationModel(**data) for data in notifications_data
        ]
        
        db.add_all(notifications)
        db.commit()
        
        return notifications
    
    @staticmethod
    def bulk_update_registration_status(
        db: Session,
        registration_ids: List[str],
        new_status: str
    ) -> int:
        """Bulk update registration statuses"""
        result = db.execute(
            update(EventRegistrationModel)
            .where(EventRegistrationModel.id.in_(registration_ids))
            .values(
                status=new_status,
                updated_at=datetime.utcnow()
            )
        )
        
        db.commit()
        return result.rowcount
    
    @staticmethod
    def bulk_delete_expired_notifications(
        db: Session,
        days_old: int = 30
    ) -> int:
        """Bulk delete old notifications"""
        cutoff_date = datetime.utcnow() - timedelta(days=days_old)
        
        result = db.execute(
            delete(NotificationModel)
            .where(
                NotificationModel.created_at < cutoff_date,
                NotificationModel.status.in_(['sent', 'failed'])
            )
        )
        
        db.commit()
        return result.rowcount


# Query performance monitoring decorator
def monitor_query_performance(func):
    """Decorator to monitor query performance"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = datetime.utcnow()
        
        try:
            result = func(*args, **kwargs)
            
            # Log slow queries (> 1 second)
            execution_time = (datetime.utcnow() - start_time).total_seconds()
            if execution_time > 1.0:
                logger.warning(
                    f"Slow query detected: {func.__name__} took {execution_time:.2f}s"
                )
            
            return result
            
        except Exception as e:
            execution_time = (datetime.utcnow() - start_time).total_seconds()
            logger.error(
                f"Query error in {func.__name__} after {execution_time:.2f}s: {e}"
            )
            raise
    
    return wrapper


# Database connection optimization
def optimize_database_connection(engine):
    """Apply database connection optimizations"""
    # Connection pool settings
    engine.pool._recycle = 3600  # Recycle connections after 1 hour
    engine.pool._pre_ping = True  # Validate connections before use
    
    # Execute optimization queries
    with engine.connect() as conn:
        # PostgreSQL specific optimizations
        if 'postgresql' in str(engine.url):
            # Enable query planner optimizations
            conn.execute(text("SET random_page_cost = 1.1"))
            conn.execute(text("SET effective_cache_size = '1GB'"))
            conn.execute(text("SET shared_preload_libraries = 'pg_stat_statements'"))
        
        # SQLite specific optimizations
        elif 'sqlite' in str(engine.url):
            conn.execute(text("PRAGMA journal_mode = WAL"))
            conn.execute(text("PRAGMA synchronous = NORMAL"))
            conn.execute(text("PRAGMA cache_size = 10000"))
            conn.execute(text("PRAGMA temp_store = MEMORY"))


# Index suggestions for better query performance
INDEX_SUGGESTIONS = """
-- Suggested database indexes for optimal performance

-- Users table
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

-- Calendars table
CREATE INDEX IF NOT EXISTS idx_calendars_owner ON calendars(owner_id);
CREATE INDEX IF NOT EXISTS idx_calendars_slug ON calendars(slug);
CREATE INDEX IF NOT EXISTS idx_calendars_visibility ON calendars(visibility);
CREATE INDEX IF NOT EXISTS idx_calendars_created ON calendars(created_at);

-- Events table
CREATE INDEX IF NOT EXISTS idx_events_calendar ON events(calendar_id);
CREATE INDEX IF NOT EXISTS idx_events_host ON events(host_user_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_visibility ON events(visibility);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_search ON events(title, description);

-- Event registrations table
CREATE INDEX IF NOT EXISTS idx_registrations_event ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_user ON event_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON event_registrations(status);
CREATE INDEX IF NOT EXISTS idx_registrations_created ON event_registrations(created_at);

-- Calendar subscriptions table
CREATE INDEX IF NOT EXISTS idx_subscriptions_calendar ON calendar_subscriptions(calendar_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON calendar_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_active ON calendar_subscriptions(is_active);

-- Calendar permissions table
CREATE INDEX IF NOT EXISTS idx_permissions_calendar ON calendar_permissions(calendar_id);
CREATE INDEX IF NOT EXISTS idx_permissions_user ON calendar_permissions(user_id);

-- Notifications table
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled ON notifications(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_events_calendar_status ON events(calendar_id, status);
CREATE INDEX IF NOT EXISTS idx_events_time_status ON events(start_time, status);
CREATE INDEX IF NOT EXISTS idx_registrations_event_status ON event_registrations(event_id, status);
"""