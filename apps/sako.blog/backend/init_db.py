"""Initialize database with sample data"""
from app.database import SessionLocal, Base, engine
from app import models

# Create tables
Base.metadata.create_all(bind=engine)

db = SessionLocal()

# Create sample categories
tech_category = models.Category(
    name="Technology",
    slug="technology",
    description="Posts about technology, programming, and software development"
)
design_category = models.Category(
    name="Design",
    slug="design",
    description="Posts about design, UI/UX, and creativity"
)
life_category = models.Category(
    name="Life",
    slug="life",
    description="Personal thoughts and life experiences"
)

db.add(tech_category)
db.add(design_category)
db.add(life_category)
db.commit()

# Create sample tags
python_tag = models.Tag(name="Python", slug="python")
javascript_tag = models.Tag(name="JavaScript", slug="javascript")
react_tag = models.Tag(name="React", slug="react")
nextjs_tag = models.Tag(name="Next.js", slug="nextjs")
fastapi_tag = models.Tag(name="FastAPI", slug="fastapi")

db.add(python_tag)
db.add(javascript_tag)
db.add(react_tag)
db.add(nextjs_tag)
db.add(fastapi_tag)
db.commit()

# Create sample post
sample_post = models.Post(
    title="Welcome to Vurik Blog",
    slug="welcome-to-vurik-blog",
    content="""# Welcome to Vurik Blog

This is my personal blog where I share my thoughts on technology, design, and life.

## What to Expect

- **Technology Posts**: Programming tutorials, tech reviews, and development insights
- **Design Articles**: UI/UX thoughts, design principles, and creative work
- **Life Stories**: Personal experiences, lessons learned, and reflections

Stay tuned for more content!""",
    excerpt="Welcome to my personal blog. Here I'll share my thoughts on technology, design, and life.",
    published=True,
    category_id=tech_category.id
)
sample_post.tags = [python_tag, fastapi_tag]

db.add(sample_post)
db.commit()

print("✅ Database initialized with sample data!")
db.close()

