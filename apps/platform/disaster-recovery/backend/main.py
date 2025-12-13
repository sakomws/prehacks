"""Main FastAPI application entry point."""
import logging
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError
from api.routes import router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Disaster Recovery Documentation System",
    description="API for managing disaster recovery documentation",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global exception handlers

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Handle Pydantic validation errors from request data.
    
    Returns a consistent error response with detailed validation messages.
    """
    errors = []
    for error in exc.errors():
        field = ".".join(str(loc) for loc in error["loc"] if loc != "body")
        message = error["msg"]
        error_type = error["type"]
        
        # Create user-friendly error message
        if field:
            errors.append(f"{field}: {message}")
        else:
            errors.append(message)
    
    error_detail = "; ".join(errors)
    logger.warning(f"Validation error on {request.url.path}: {error_detail}")
    
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "detail": f"Validation error: {error_detail}",
            "status_code": 400,
            "error_type": "ValidationError",
            "errors": [
                {
                    "field": ".".join(str(loc) for loc in error["loc"] if loc != "body"),
                    "message": error["msg"],
                    "type": error["type"]
                }
                for error in exc.errors()
            ]
        }
    )


@app.exception_handler(ValidationError)
async def pydantic_validation_exception_handler(request: Request, exc: ValidationError):
    """
    Handle Pydantic validation errors from model validation.
    
    Returns a consistent error response with detailed validation messages.
    """
    errors = []
    for error in exc.errors():
        field = ".".join(str(loc) for loc in error["loc"])
        message = error["msg"]
        errors.append(f"{field}: {message}")
    
    error_detail = "; ".join(errors)
    logger.warning(f"Model validation error on {request.url.path}: {error_detail}")
    
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "detail": f"Validation error: {error_detail}",
            "status_code": 400,
            "error_type": "ValidationError",
            "errors": [
                {
                    "field": ".".join(str(loc) for loc in error["loc"]),
                    "message": error["msg"],
                    "type": error["type"]
                }
                for error in exc.errors()
            ]
        }
    )


@app.exception_handler(ValueError)
async def value_error_exception_handler(request: Request, exc: ValueError):
    """
    Handle ValueError exceptions.
    
    Returns a 400 Bad Request with the error message.
    """
    logger.warning(f"ValueError on {request.url.path}: {str(exc)}")
    
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "detail": str(exc),
            "status_code": 400,
            "error_type": "ValueError"
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """
    Handle all other unhandled exceptions.
    
    Returns a 500 Internal Server Error with a generic message.
    Logs the full exception for debugging.
    """
    logger.error(
        f"Unhandled exception on {request.url.path}: {type(exc).__name__}: {str(exc)}",
        exc_info=True
    )
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "An internal server error occurred",
            "status_code": 500,
            "error_type": type(exc).__name__
        }
    )


# Include API routes
app.include_router(router)


@app.get("/")
async def root():
    """Health check endpoint."""
    return {"status": "ok", "message": "DR Documentation System API"}


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)