from django.contrib import admin

from modules.transactions.models import Sale, SaleDetail


# Register your models here.
@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    search_fields = ('employee', 'cash',)
    list_display = ('employee', 'payment_method', 'subtotal', 'total', 'cash', 'change')


@admin.register(SaleDetail)
class SaleDetailAdmin(admin.ModelAdmin):
    search_fields = ('product',)
    list_display = ('sale', 'product', 'cant', 'amount_won', 'price', 'subtotal')
