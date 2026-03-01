# app/utils/__init__.py
"""
Utility functions
"""
from .tenant import get_restaurant_from_subdomain, verify_restaurant_exists

__all__ = ["get_restaurant_from_subdomain", "verify_restaurant_exists"]