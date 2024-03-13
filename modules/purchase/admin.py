from django.contrib import admin

from modules.purchase.models import Provider, Purchase, PurchaseDetail


# Register your models here.


@admin.register(Provider)
class ProviderAdmin(admin.ModelAdmin):
    search_fields = ('name', 'ruc', 'mobile',)
    list_display = ('name', 'ruc', 'mobile', 'address', 'email')


@admin.register(Purchase)
class PurchaseAdmin(admin.ModelAdmin):
    search_fields = ('number', 'created_at',)
    list_display = ('number', 'provider', 'created_at', 'subtotal')


@admin.register(PurchaseDetail)
class PurchaseDetailAdmin(admin.ModelAdmin):
    search_fields = ('number', 'created_at',)
    list_display = ('purchase', 'product', 'cant', 'purchase_price', 'subtotal')
