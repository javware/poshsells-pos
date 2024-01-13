from django.contrib import admin
from django.utils.html import format_html
from modules.inventory.models import Category, Brand, Product


# Register your models here.

# admin


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    search_fields = ('name', 'status', 'created_at',)
    list_display = ('name', 'status', 'created_at')


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    search_fields  = ('name', 'status', 'created_at',)
    list_display = ('name', 'status', 'created_at')


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    search_fields  = ('name', 'image', 'brand__name', 'category__name', 'stock', 'purchase_price', 'sale_price', 'status', 'created_at',)
    list_display = ('name', 'display_image', 'brand', 'category', 'stock', 'purchase_price', 'sale_price', 'status')
    autocomplete_fields = ['brand','category']

    def display_image(self, obj):
        if obj.image:
            image_url = obj.image.url
            return format_html('<img src="{}" alt="{}" style="max-height: 50px; max-width: 50px;" />',
                           image_url, obj.name)

    display_image.short_description = 'Image'