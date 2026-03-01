# app/services/admin/__init__.py
"""
Admin services
"""
from .auth_service import authenticate_restaurant, create_access_token
from .dashboard_service import (
    get_dashboard_summary_data, 
    get_orders_by_status,
    get_popular_items,
    get_restaurant_currency
)

__all__ = [
    "authenticate_restaurant", 
    "create_access_token",
    "get_dashboard_summary_data", 
    "get_orders_by_status",
    "get_popular_items",
    "get_restaurant_currency"
]