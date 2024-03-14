from django.db.models import Q, Sum, FloatField
from django.db.models.functions import Coalesce, Round

from modules.box_point.models import CashRegister, CashMovement
from modules.transactions.models import SaleDetail


def calculate_closing_cash(request):
    cash_register = CashRegister.objects.filter(status='Opened').first()
    details_sale = SaleDetail.objects.filter(sale__cash_register_id=cash_register.id)
    details_cash_register = CashMovement.objects.filter(cash_register_id=cash_register.id)

    total_earnings = details_sale.aggregate(result=Coalesce(Sum('amount_won'), 0.00, output_field=FloatField()))['result']
    income_total = details_cash_register.aggregate(result=Coalesce(Sum('income_amount'), 0.00, output_field=FloatField()))['result']
    exit_total = details_cash_register.aggregate(result=Coalesce(Sum('exit_amount'), 0.00, output_field=FloatField()))['result']
    opening_total = details_cash_register.filter(cash_type="Opening").aggregate(result=Coalesce(Sum('income_amount'), 0.00, output_field=FloatField()))['result']

    data_exit = {
        'status': cash_register.status,
        'user': request.user.username,
        'exit_total': exit_total,
        'income_total': income_total - opening_total,
        'opening_total': opening_total,
        'total_earnings': total_earnings,
        'total_cash': income_total - exit_total
    }
    return data_exit