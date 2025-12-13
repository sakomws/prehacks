"""Search engine for DR documents."""
from typing import List
from models.document import DRDocument


class SearchResult:
    """Represents a search result with ranking information."""
    
    def __init__(self, document: DRDocument, rank: int):
        """
        Initialize a search result.
        
        Args:
            document: The matching document
            rank: The ranking score (higher is better)
                  3 = title match
                  2 = scenario match
                  1 = procedure match
        """
        self.document = document
        self.rank = rank
    
    def __repr__(self):
        return f"SearchResult(document_id='{self.document.id}', rank={self.rank})"


class SearchEngine:
    """Search engine for finding DR documents by keywords."""
    
    def search(self, documents: List[DRDocument], query: str) -> List[DRDocument]:
        """
        Search documents by keyword(s).
        
        Supports:
        - Case-insensitive matching
        - Multiple keywords (OR logic)
        - Searches across title, scenario, and procedures
        - Empty query returns all documents
        
        Args:
            documents: List of documents to search
            query: Search query (can contain multiple keywords separated by spaces)
            
        Returns:
            List of matching documents, ranked by relevance
        """
        # Handle empty query - return all documents
        if not query or not query.strip():
            return documents
        
        # Extract keywords from query
        keywords = query.lower().split()
        
        # Find matching documents with ranking
        results = []
        
        for doc in documents:
            rank = self._calculate_rank(doc, keywords)
            if rank > 0:
                results.append(SearchResult(doc, rank))
        
        # Sort by rank (descending) - higher rank first
        results.sort(key=lambda r: r.rank, reverse=True)
        
        # Return just the documents
        return [result.document for result in results]
    
    def _calculate_rank(self, document: DRDocument, keywords: List[str]) -> int:
        """
        Calculate the rank of a document for the given keywords.
        
        Ranking:
        - 3: Keyword appears in title
        - 2: Keyword appears in scenario
        - 1: Keyword appears in procedures
        - 0: No match
        
        Uses OR logic: if any keyword matches, the document is included.
        Returns the highest rank among all keyword matches.
        
        Args:
            document: The document to rank
            keywords: List of keywords to search for
            
        Returns:
            The rank score (0-3)
        """
        max_rank = 0
        
        for keyword in keywords:
            # Check title (rank 3)
            if keyword in document.title.lower():
                max_rank = max(max_rank, 3)
                continue  # Already highest rank for this keyword
            
            # Check scenario (rank 2)
            if keyword in document.scenario.lower():
                max_rank = max(max_rank, 2)
                continue
            
            # Check procedures (rank 1)
            for procedure in document.procedures:
                # Check procedure name
                if keyword in procedure.name.lower():
                    max_rank = max(max_rank, 1)
                    break
                
                # Check procedure steps
                for step in procedure.steps:
                    if keyword in step.lower():
                        max_rank = max(max_rank, 1)
                        break
                
                if max_rank >= 1:
                    break
        
        return max_rank
