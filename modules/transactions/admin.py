from django.contrib import admin
from modules.transactions.models import Sale, SaleDetail


# Register your models here.
@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    search_fields  = ('cash', 'created_at',)
    # list_display = ('status', 'created_at')

@admin.register(SaleDetail)
class SaleDetailAdmin(admin.ModelAdmin):
    search_fields  = ('cant',)
    # list_display = ('cant',)