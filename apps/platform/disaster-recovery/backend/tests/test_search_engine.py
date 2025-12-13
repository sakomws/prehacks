"""Unit tests for search engine."""
import pytest
from services.search_engine import SearchEngine
from models.document import DRDocument, Procedure, Contact


def test_empty_query_returns_all_documents():
    """
    Test that empty search returns all documents.
    
    Validates: Requirements 7.3
    """
    # Create search engine
    search_engine = SearchEngine()
    
    # Create test documents
    doc1 = DRDocument(
        title="Database Failure",
        scenario="Primary database fails",
        procedures=[Procedure(
            name="Failover",
            steps=["Step 1", "Step 2"],
            estimated_duration=10
        )],
        contacts=[Contact(
            name="John Doe",
            role="DBA",
            phone="+1-555-0100",
            email="john@example.com"
        )],
        rto=60,
        rpo=30,
        category="Infrastructure",
        criticality="critical"
    )
    
    doc2 = DRDocument(
        title="Network Outage",
        scenario="Network connectivity lost",
        procedures=[Procedure(
            name="Restore Network",
            steps=["Check cables", "Restart router"],
            estimated_duration=15
        )],
        contacts=[Contact(
            name="Jane Smith",
            role="Network Admin",
            phone="+1-555-0200",
            email="jane@example.com"
        )],
        rto=30,
        rpo=15,
        category="Network",
        criticality="high"
    )
    
    doc3 = DRDocument(
        title="Application Crash",
        scenario="Application server crashes",
        procedures=[Procedure(
            name="Restart Application",
            steps=["Stop service", "Start service"],
            estimated_duration=5
        )],
        contacts=[Contact(
            name="Bob Johnson",
            role="DevOps",
            phone="+1-555-0300",
            email="bob@example.com"
        )],
        rto=15,
        rpo=5,
        category="Application",
        criticality="medium"
    )
    
    documents = [doc1, doc2, doc3]
    
    # Test with empty string
    results = search_engine.search(documents, "")
    assert len(results) == 3, "Empty query should return all documents"
    assert set(doc.id for doc in results) == set(doc.id for doc in documents), \
        "Empty query should return all documents"
    
    # Test with whitespace-only string
    results = search_engine.search(documents, "   ")
    assert len(results) == 3, "Whitespace-only query should return all documents"
    assert set(doc.id for doc in results) == set(doc.id for doc in documents), \
        "Whitespace-only query should return all documents"
    
    # Test with None (if supported)
    # Note: This might raise an error depending on implementation
    # Uncomment if the implementation should handle None
    # results = search_engine.search(documents, None)
    # assert len(results) == 3, "None query should return all documents"


def test_search_with_no_matches():
    """Test that search with no matches returns empty list."""
    # Create search engine
    search_engine = SearchEngine()
    
    # Create test documents
    doc1 = DRDocument(
        title="Database Failure",
        scenario="Primary database fails",
        procedures=[Procedure(
            name="Failover",
            steps=["Step 1", "Step 2"],
            estimated_duration=10
        )],
        contacts=[Contact(
            name="John Doe",
            role="DBA",
            phone="+1-555-0100",
            email="john@example.com"
        )],
        rto=60,
        rpo=30,
        category="Infrastructure",
        criticality="critical"
    )
    
    documents = [doc1]
    
    # Search for keyword that doesn't exist
    results = search_engine.search(documents, "nonexistent")
    assert len(results) == 0, "Search with no matches should return empty list"


def test_search_case_insensitive():
    """Test that search is case-insensitive."""
    # Create search engine
    search_engine = SearchEngine()
    
    # Create test document
    doc1 = DRDocument(
        title="Database Failure",
        scenario="Primary database fails",
        procedures=[Procedure(
            name="Failover",
            steps=["Step 1", "Step 2"],
            estimated_duration=10
        )],
        contacts=[Contact(
            name="John Doe",
            role="DBA",
            phone="+1-555-0100",
            email="john@example.com"
        )],
        rto=60,
        rpo=30,
        category="Infrastructure",
        criticality="critical"
    )
    
    documents = [doc1]
    
    # Search with different cases
    results_lower = search_engine.search(documents, "database")
    results_upper = search_engine.search(documents, "DATABASE")
    results_mixed = search_engine.search(documents, "DaTaBaSe")
    
    assert len(results_lower) == 1, "Lowercase search should find document"
    assert len(results_upper) == 1, "Uppercase search should find document"
    assert len(results_mixed) == 1, "Mixed case search should find document"
    
    # All should return the same document
    assert results_lower[0].id == doc1.id
    assert results_upper[0].id == doc1.id
    assert results_mixed[0].id == doc1.id


def test_search_multiple_keywords_or_logic():
    """Test that search with multiple keywords uses OR logic."""
    # Create search engine
    search_engine = SearchEngine()
    
    # Create test documents
    doc1 = DRDocument(
        title="Database Failure",
        scenario="Primary database fails",
        procedures=[Procedure(
            name="Failover",
            steps=["Step 1", "Step 2"],
            estimated_duration=10
        )],
        contacts=[Contact(
            name="John Doe",
            role="DBA",
            phone="+1-555-0100",
            email="john@example.com"
        )],
        rto=60,
        rpo=30,
        category="Infrastructure",
        criticality="critical"
    )
    
    doc2 = DRDocument(
        title="Network Outage",
        scenario="Network connectivity lost",
        procedures=[Procedure(
            name="Restore Network",
            steps=["Check cables", "Restart router"],
            estimated_duration=15
        )],
        contacts=[Contact(
            name="Jane Smith",
            role="Network Admin",
            phone="+1-555-0200",
            email="jane@example.com"
        )],
        rto=30,
        rpo=15,
        category="Network",
        criticality="high"
    )
    
    doc3 = DRDocument(
        title="Application Crash",
        scenario="Application server crashes",
        procedures=[Procedure(
            name="Restart Application",
            steps=["Stop service", "Start service"],
            estimated_duration=5
        )],
        contacts=[Contact(
            name="Bob Johnson",
            role="DevOps",
            phone="+1-555-0300",
            email="bob@example.com"
        )],
        rto=15,
        rpo=5,
        category="Application",
        criticality="medium"
    )
    
    documents = [doc1, doc2, doc3]
    
    # Search with multiple keywords (OR logic)
    # "database" matches doc1, "network" matches doc2
    results = search_engine.search(documents, "database network")
    
    assert len(results) == 2, "Should find documents matching either keyword"
    result_ids = {doc.id for doc in results}
    assert doc1.id in result_ids, "Should find document with 'database'"
    assert doc2.id in result_ids, "Should find document with 'network'"
    assert doc3.id not in result_ids, "Should not find document without either keyword"
