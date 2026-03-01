# app/schemas/admin/__init__.py
"""
Admin schemas
"""
from .auth import LoginRequest, LoginResponse, RestaurantOut
from .dashboard import DashboardSummaryResponse, RecentOrder, PopularItem, PeriodInfo, RestaurantInfo, DashboardStats

__all__ = [
    "LoginRequest", "LoginResponse", "RestaurantOut",
    "DashboardSummaryResponse", "RecentOrder", "PopularItem",
    "PeriodInfo", "RestaurantInfo", "DashboardStats"
]