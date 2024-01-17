from datetime import datetime

from django.contrib.auth.models import User
from django.db import models
from django.forms import model_to_dict
from config.settings import MEDIA_URL, STATIC_URL


# Create your models here.

class Status(models.TextChoices):
    ACTIVE = 'Active', 'Activo'
    INACTIVE = 'Inactive', 'Inactivo'


class StatusCash(models.TextChoices):
    APENING = 'Opening', 'Apertura'
    CLOSED = 'Closed', 'Cerrado'


class PaymentType(models.TextChoices):
    CASH = 'Cash', 'Efectivo'
    YAPE_PLIN = 'Yape-Plin', 'Yape-Plin'
    TRANSFER = 'Transfer', 'Transferencia'


# CATEGORÍAS
class Category(models.Model):
    name = models.CharField(verbose_name='Nombre', max_length=180)
    description = models.TextField(verbose_name='Descripción', null=True, blank=True)
    status = models.CharField(verbose_name='Estado', max_length=15, choices=Status.choices, default=Status.ACTIVE)
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de Creación')

    def __str__(self):
        return self.name

    def toJSON(self):
        item = model_to_dict(self)
        return item

    class Meta:
        verbose_name = 'Categoría'
        verbose_name_plural = 'Categorías'
        ordering = ['-id']


# MARCA DE PRODUCTO
class Brand(models.Model):
    name = models.CharField(verbose_name='Nombre', max_length=180)
    status = models.CharField(verbose_name='Estado', max_length=15, choices=Status.choices, default=Status.ACTIVE)
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de Creación')

    def __str__(self):
        return self.name

    def toJSON(self):
        item = model_to_dict(self)
        return item

    class Meta:
        verbose_name = 'Marca'
        verbose_name_plural = 'Marcas'
        ordering = ['-id']


# PRODUCTOS
class Product(models.Model):
    name = models.CharField(verbose_name='Nombre', max_length=180)
    image = models.ImageField(upload_to='product', verbose_name='Imagen de Producto', null=True, blank=True)
    brand = models.ForeignKey(Brand, on_delete=models.CASCADE, verbose_name='Marca')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, verbose_name='Categoría')
    stock = models.IntegerField(verbose_name='Stock', default=0)
    purchase_price = models.DecimalField(max_digits=6, decimal_places=2, verbose_name='Precio de Compra', default=0,
                                         null=True, blank=False)
    sale_price = models.DecimalField(max_digits=6, decimal_places=2, verbose_name='Precio de Venta', default=0,
                                     null=True, blank=False)
    status = models.CharField(verbose_name='Estado', max_length=15, choices=Status.choices, default=Status.ACTIVE)
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de Creación')

    def __str__(self):
        return self.name

    def toJSON(self):
        item = model_to_dict(self)
        item['purchase_price'] = f'{self.purchase_price:.2f}'
        item['sale_price'] = f'{self.sale_price:.2f}'
        item['brand'] = {} if self.brand is None else self.brand.toJSON()
        item['image'] = '{}{}'.format(MEDIA_URL, self.image)
        item['category'] = {} if self.category is None else self.category.toJSON()
        return item

    class Meta:
        verbose_name = 'Producto'
        verbose_name_plural = 'Productos'
        ordering = ['-id']


# APERTURA DE CAJA
class CashRegister(models.Model):
    opening_amount = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Monto de Apertura')
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='Usuario que Abrió')
    opening_date = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de Apertura')
    closing_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True,
                                         verbose_name='Monto de Cierre')
    closing_date = models.DateTimeField(null=True, blank=True, verbose_name='Fecha de Cierre')
    description = models.TextField(null=True, blank=True, verbose_name="Descripción")
    status = models.CharField(max_length=15, choices=StatusCash.choices, default=StatusCash.APENING)

    def __str__(self):
        return f'Caja {self.id} - {self.status}'

    class Meta:
        verbose_name = 'Caja'
        verbose_name_plural = 'Cajas'
        ordering = ['-id']


