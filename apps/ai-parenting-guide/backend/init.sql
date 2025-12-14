-- Initial database setup for AI Parenting Guide Platform
-- This file is executed when PostgreSQL container starts

-- Create database if it doesn't exist (handled by Docker environment)
-- CREATE DATABASE ai_parenting_guide;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Create custom types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('learner', 'educator', 'expert', 'moderator', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE age_group AS ENUM ('child', 'teen', 'adult');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE content_category AS ENUM (
        'ai-ethics-basics',
        'bias-and-fairness', 
        'transparency-accountability',
        'privacy-security',
        'human-ai-interaction',
        'philosophical-questions',
        'practical-implementation',
        'case-studies'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE content_type AS ENUM ('text', 'image', 'video', 'audio', 'interactive', 'mixed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create indexes for full-text search
-- These will be created by SQLAlchemy models, but we can prepare the database

-- Grant permissions (if needed for specific user)
-- GRANT ALL PRIVILEGES ON DATABASE ai_parenting_guide TO postgres;

-- Set timezone
SET timezone = 'UTC';