from django.contrib.auth.models import User
from django.db import models
from django.forms import model_to_dict

from modules.box_point.models import CashRegister
from modules.inventory.models import PaymentType, Product


# Create your models here.
# VENTA
class Sale(models.Model):
    employee = models.ForeignKey(User, on_delete=models.PROTECT, null=True, blank=True)
    cash_register = models.ForeignKey(CashRegister, on_delete=models.CASCADE, verbose_name='Punto de Caja')
    payment_method = models.CharField(choices=PaymentType, max_length=50, default=PaymentType.CASH,
                                      verbose_name='Método de pago')
    cash = models.DecimalField(max_digits=9, decimal_places=2, default=0.00, verbose_name='Efectivo recibido')
    change = models.DecimalField(max_digits=9, decimal_places=2, default=0.00, verbose_name='Cambio')
    subtotal = models.DecimalField(max_digits=9, decimal_places=2, default=0.00, verbose_name='Subtotal')
    total = models.DecimalField(max_digits=9, decimal_places=2, default=0.00, verbose_name='Total a pagar')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de Creación')

    def __str__(self):
        return self.payment_method

    def toJSON(self):
        item = model_to_dict(self, exclude=[''])
        item['created_at'] = self.created_at.strftime('%Y-%m-%d')
        excluded_user_fields = ['password', 'user_permissions', 'groups', 'last_login', 'is_superuser', 'is_staff',
                                'is_active', 'date_joined']
        item['employee'] = model_to_dict(self.employee, exclude=excluded_user_fields)

        item['payment_method'] = self.payment_method
        item['subtotal'] = f'{self.subtotal:.2f}'
        item['total'] = f'{self.total:.2f}'
        item['cash'] = f'{self.cash:.2f}'
        item['change'] = f'{self.change:.2f}'
        return item

    class Meta:
        verbose_name = 'Venta'
        verbose_name_plural = 'Ventas'
        default_permissions = ()
        permissions = (
            ('view_sale', 'Can view Venta'),
            ('add_sale', 'Can add Venta'),
            ('delete_sale', 'Can delete Venta'),
            ('view_sale_client', 'Can view_sale_client Venta'),
        )
        ordering = ['-id']


# DETALLE DE VENTA
class SaleDetail(models.Model):
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    cant = models.IntegerField(default=0)
    amount_won = models.DecimalField(max_digits=9, decimal_places=2, default=0.00)
    price = models.DecimalField(max_digits=9, decimal_places=2, default=0.00)
    subtotal = models.DecimalField(max_digits=9, decimal_places=2, default=0.00)

    def __str__(self):
        return self.product.name

    def toJSON(self):
        item = model_to_dict(self, exclude=['sale'])
        item['sale'] = {} if not self.sale else self.sale.toJSON()
        item['product'] = {} if not self.product else self.product.toJSON()
        item['price'] = f'{self.price:.2f}'
        item['amount_won'] = f'{self.amount_won:.2f}'
        item['subtotal'] = f'{self.subtotal:.2f}'
        return item

    class Meta:
        verbose_name = 'Detalle de Venta'
        verbose_name_plural = 'Detalle de Ventas'
        default_permissions = ()
        ordering = ['-id']
