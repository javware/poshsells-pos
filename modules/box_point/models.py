from django.contrib.auth.models import User
from django.db import models
from django.forms import model_to_dict


# Create your models here.


class StatusCash(models.TextChoices):
    OPENED = 'Opened', 'Aperturado'
    CLOSED = 'Closed', 'Cerrado'


class CashType(models.TextChoices):
    OPENING = 'Opening', 'Apertura'
    INCOME = 'Income', 'Ingreso'
    EXIT = 'Exit', 'Salida'
    EXPENSE = 'Expense', 'Gasto'
    CLOSING = 'Closing', 'Cierre'

class TypeOperation(models.TextChoices):
    OPENING = 'Opening', 'Apertura de Caja'
    SALE = 'Sale', 'Venta'
    PURCHASE = 'Purchase', 'Compra'
    EXPENSE = 'Expense', 'Gasto'
    INCOME = 'Income', 'Ingreso'
    WITHDRAWAL = 'Withdrawal', 'Retiro'
    TRANSFER = 'Transfer', 'Transferencia'
    PAYMENT = 'Payment', 'Pago'
    COLLECTION = 'Collection', 'Cobro'
    REFUND = 'Refund', 'Devolución'
    ADJUSTMENT = 'Adjustment', 'Ajuste'
    DEPOSIT = 'Deposit', 'Depósito'
    CASH_WITHDRAWAL = 'Cash_Withdrawal', 'Retiro de efectivo'
    INVOICE_PAYMENT = 'Invoice_Payment', 'Pago de factura'
    INCOME_RECEIPT = 'Income_Receipt', 'Recibo de ingreso'
    BANK_TRANSFER = 'Bank_Transfer', 'Transferencia bancaria'

# APERTURA DE CAJA
class CashRegister(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='Usuario que Abrió')
    opening_amount = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Monto de Apertura')
    opening_date = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de Apertura')
    closing_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name='Monto de Cierre')
    closing_date = models.DateTimeField(null=True, blank=True, verbose_name='Fecha de Cierre')
    difference_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name='Monto Sobrante')
    net_amount  = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name='Ganancia Neto')
    cash_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name='Monto Caja')
    status = models.CharField(max_length=15, choices=StatusCash.choices, default=StatusCash.OPENED)

    def __str__(self):
        return f'Caja- {self.id} - {self.status}'

    def toJSON(self):
        item = model_to_dict(self)
        excluded_user_fields = ['password', 'user_permissions', 'groups', 'last_login', 'is_superuser', 'is_staff',
                                'is_active', 'date_joined']
        item['user'] = model_to_dict(self.user, exclude=excluded_user_fields)
        item['opening_amount'] = f'{self.opening_amount:.2f}'
        item['opening_date'] = self.opening_date.strftime('%Y-%m-%d')
        item['closing_amount'] = f'{self.closing_amount:.2f}' if self.closing_amount else '-'
        item['closing_date'] = self.closing_date.strftime('%Y-%m-%d') if self.closing_date else '-'
        item['difference_amount'] = f'{self.difference_amount:.2f}' if self.difference_amount else '-'
        item['net_amount'] = f'{self.net_amount:.2f}' if self.net_amount else '-'
        item['cash_amount'] = f'{self.cash_amount:.2f}' if self.cash_amount else '-'
        return item

    class Meta:
        verbose_name = 'Punto de Caja'
        verbose_name_plural = 'Punto de Caja'
        ordering = ['-id']


# MOVIMIENTOS
class CashMovement(models.Model):
    cash_register = models.ForeignKey(CashRegister, on_delete=models.CASCADE, verbose_name='Punto de Caja')
    cash_type = models.CharField(max_length=30, choices=CashType.choices, default=CashType.OPENING,
                                 verbose_name='T. Movimiento')
    type_operation = models.CharField(max_length=30, choices=TypeOperation.choices, verbose_name='Operación')
    income_amount = models.DecimalField(null=True, blank=True, max_digits=10, decimal_places=2, verbose_name='Ingreso')
    exit_amount = models.DecimalField(null=True, blank=True, max_digits=10, decimal_places=2, verbose_name='Egreso')
    description = models.TextField(null=True, blank=True, verbose_name='Descripción')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de Creación')

    def __str__(self):
        return f'Movimiento por caja - {self.description}'

    def toJSON(self):
        item = model_to_dict(self)
        item['description'] = self.description if self.description else '-'
        item['cash_register'] = {} if not self.cash_register else self.cash_register.toJSON()
        item['income_amount'] = f'{self.income_amount:.2f}' if self.income_amount else '-'
        item['exit_amount'] = f'{self.exit_amount:.2f}' if self.exit_amount else '-'
        item['created_at'] = self.created_at.strftime('%Y-%m-%d') if self.created_at else '-'
        return item

    class Meta:
        verbose_name = 'Movimiento por Caja'
        verbose_name_plural = 'Movimientos por Caja'
        ordering = ['-id']


# TIPO GASTO
class ExpenseType(models.Model):
    name = models.CharField(verbose_name="Nombre:", max_length=150)
    description = models.TextField(verbose_name='Descripción', null=True, blank=True)
    state = models.BooleanField(verbose_name='Estado', default=True)
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de Creación')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Fecha de Actualización')

    def __str__(self):
        return str(self.name)

    def toJSON(self):
        item = model_to_dict(self)
        item['created_at'] = self.created_at.strftime('%Y-%m-%d')
        item['updated_at'] = self.updated_at.strftime('%Y-%m-%d')
        return item

    class Meta:
        verbose_name = 'Tipo de Gasto'
        verbose_name_plural = 'Tipo de Gasto'
        ordering = ['-id']


# GASTO
class Expense(models.Model):
    expense_type = models.ForeignKey("ExpenseType", verbose_name="Tipo de Gasto", on_delete=models.PROTECT)
    amount = models.DecimalField(verbose_name="Monto", default=0.00, max_digits=9, decimal_places=2)
    description = models.TextField(verbose_name='Descripción', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de Creación')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Fecha de Actualización')

    def __str__(self):
        return str(self.amount)

    def toJSON(self):
        item = model_to_dict(self)
        item['expense_type'] = self.expense_type.toJSON()
        item['created_at'] = self.created_at.strftime('%Y-%m-%d')
        item['updated_at'] = self.updated_at.strftime('%Y-%m-%d')
        return item

    class Meta:
        verbose_name = 'Gastos'
        verbose_name_plural = 'Gastos'
        ordering = ['-id']
