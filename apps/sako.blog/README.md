# Vurik Blog - Personal Blog

A modern personal blog built with Next.js frontend and FastAPI backend.

## 🌟 Features

- **Modern UI**: Clean, responsive design with dark mode support
- **Markdown Support**: Write posts in Markdown with full formatting
- **Categories & Tags**: Organize posts with categories and tags
- **Fast API**: FastAPI backend with SQLAlchemy ORM
- **TypeScript**: Full TypeScript support for type safety

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Markdown**: React Markdown with GFM support

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.11+
- **Database**: SQLite (dev) / PostgreSQL (production)
- **ORM**: SQLAlchemy

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- npm or yarn

### Installation

1. **Install backend dependencies**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. **Initialize database**
```bash
python init_db.py
```

3. **Install frontend dependencies**
```bash
cd ../frontend
npm install
```

4. **Start development servers**

**Backend:**
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm run dev
```

5. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## 📁 Project Structure

```
sako.blog/
├── backend/
│   ├── app/
│   │   ├── api/          # API routes
│   │   ├── models.py     # Database models
│   │   ├── schemas.py    # Pydantic schemas
│   │   └── database.py   # Database configuration
│   ├── main.py          # FastAPI application
│   ├── init_db.py       # Database initialization
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/         # Next.js app router pages
│   │   ├── components/  # React components
│   │   └── lib/         # Utilities and API client
│   └── package.json
└── README.md
```

## 📝 API Endpoints

### Posts
- `GET /api/posts` - Get all posts (with filtering)
- `GET /api/posts/{id}` - Get post by ID
- `GET /api/posts/slug/{slug}` - Get post by slug
- `POST /api/posts` - Create new post
- `PUT /api/posts/{id}` - Update post
- `DELETE /api/posts/{id}` - Delete post

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/{id}` - Get category by ID
- `POST /api/categories` - Create category
- `DELETE /api/categories/{id}` - Delete category

### Tags
- `GET /api/tags` - Get all tags
- `GET /api/tags/{id}` - Get tag by ID
- `POST /api/tags` - Create tag
- `DELETE /api/tags/{id}` - Delete tag

## 🔧 Configuration

### Environment Variables

**Backend (.env):**
```env
DATABASE_URL=sqlite:///./vurik_blog.db
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📄 License

MIT License - feel free to use this for your own blog!

---

**Built with ❤️ for personal blogging**

