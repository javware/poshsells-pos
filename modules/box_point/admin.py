from django.contrib import admin

from modules.box_point.models import CashRegister, CashMovement, ExpenseType, Expense


# Register your models here.
@admin.register(CashRegister)
class CashRegisterAdmin(admin.ModelAdmin):
    search_fields = (
        'opening_amount', 'opening_date', 'closing_amount', 'closing_date', 'status',)
    list_display = ('user', 'opening_date', 'opening_amount', 'closing_date', 'closing_amount', 'cash_amount',
                    'difference_amount', 'net_amount', 'status')


@admin.register(CashMovement)
class CashMovementAdmin(admin.ModelAdmin):
    search_fields = ('description',)
    list_display = ('cash_register', 'created_at', 'description', 'cash_type', 'income_amount', 'exit_amount')


@admin.register(ExpenseType)
class ExpenseTypeAdmin(admin.ModelAdmin):
    search_fields = ('description',)
    list_display = ('name', 'description', 'state', 'created_at')


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    search_fields = ('description',)
    list_display = ('expense_type', 'amount', 'description', 'created_at')
