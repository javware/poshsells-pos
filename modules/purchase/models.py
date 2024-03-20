from datetime import datetime

from django.db import models
from django.forms import model_to_dict

from modules.inventory.models import Product

class ReceiptType(models.TextChoices):
    TICKET = 'Ticket', 'Boleta'
    BILL = 'bill', 'Factura'

# Create your models here.

# PROVEEDOR
class Provider(models.Model):
    name = models.CharField(max_length=50, unique=True, verbose_name='Nombre')
    ruc = models.CharField(max_length=13, unique=True, verbose_name='Ruc')
    mobile = models.CharField(max_length=10, unique=True, verbose_name='Teléfono celular')
    address = models.CharField(max_length=500, null=True, blank=True, verbose_name='Dirección')
    email = models.CharField(max_length=50, unique=True, verbose_name='Email')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de Creación')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Fecha de Actualización')
    def __str__(self):
        return self.get_full_name()

    def get_full_name(self):
        return f'{self.name} ({self.ruc})'

    def toJSON(self):
        item = model_to_dict(self)
        return item

    class Meta:
        verbose_name = 'Proveedor'
        verbose_name_plural = 'Proveedores'
        ordering = ['-id']

# COMPRAS
class Purchase(models.Model):
    provider = models.ForeignKey(Provider, on_delete=models.PROTECT, verbose_name='Proveedor')
    receipt_type = models.CharField(verbose_name='Tipo de Comprobante', max_length=50, choices=ReceiptType.choices)
    serie = models.CharField(max_length=8, verbose_name='Serie')
    number = models.CharField(max_length=8, verbose_name='Número de Serie')
    date_voucher = models.DateField(default=datetime.now, verbose_name='Fecha de comprobante')
    igv_cal = models.DecimalField(max_digits=9, decimal_places=2, default=0.00)
    subtotal = models.DecimalField(max_digits=9, decimal_places=2, default=0.00)
    total = models.DecimalField(max_digits=9, decimal_places=2, default=0.00)
    description_purchase = models.TextField(verbose_name='Descripción')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de Creación')

    def __str__(self):
        return self.provider.name

    def calculate_invoice(self):
        subtotal = 0.00
        for i in self.purchasedetail_set.all():
            subtotal += float(i.price) * int(i.cant)
        self.subtotal = subtotal
        self.save()


    def toJSON(self):
        item = model_to_dict(self)
        item['date_voucher'] = self.date_voucher.strftime('%Y-%m-%d')
        item['created_at'] = self.created_at.strftime('%Y-%m-%d')
        item['provider'] = self.provider.toJSON()
        item['subtotal'] = f'{self.subtotal:.2f}'
        item['total'] = f'{self.total:.2f}'
        return item

    class Meta:
        verbose_name = 'Compra'
        verbose_name_plural = 'Compras'
        default_permissions = ()
        permissions = (
            ('view_purchase', 'Can view Compra'),
            ('add_purchase', 'Can add Compra'),
            ('delete_purchase', 'Can delete Compra'),
        )
        ordering = ['-id']

# DETALLE DE COMPRAS
class PurchaseDetail(models.Model):
    purchase = models.ForeignKey(Purchase, on_delete=models.PROTECT)
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    cant = models.DecimalField(max_digits=9, decimal_places=4, default=0.00)
    purchase_price = models.DecimalField(max_digits=9, decimal_places=2, default=0.00)
    sale_price = models.DecimalField(max_digits=9, decimal_places=2, default=0.00)
    subtotal = models.DecimalField(max_digits=9, decimal_places=2, default=0.00)

    def __str__(self):
        return self.product.name

    def toJSON(self):
        item = model_to_dict(self, exclude=['purchase'])
        item['purchase'] = self.purchase.toJSON()
        item['product'] = self.product.toJSON()
        item['purchase_price'] = f'{self.purchase_price:.2f}'
        item['cant'] = f'{self.cant:.4f}'
        item['sale_price'] = f'{self.sale_price:.2f}'
        item['subtotal'] = f'{self.subtotal:.2f}'
        return item

    class Meta:
        verbose_name = 'Detalle de Compra'
        verbose_name_plural = 'Detalle de Compras'
        default_permissions = ()
        ordering = ['-id']

