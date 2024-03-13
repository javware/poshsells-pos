from import_export import fields, resources
from django.db import models
from .models import Product, Brand, Category
from import_export.widgets import ForeignKeyWidget


class ForeignKeyWidgetWithCreation(ForeignKeyWidget, models.Model):
    def clean(self, value, row=None, *args, **kwargs):
        try:
            return super(ForeignKeyWidgetWithCreation, self).clean(value, row, *args, **kwargs)
        except self.model.DoesNotExist:
            print(f"Object does not exist for {self.model.__name__} with {self.field}={value}. Creating...")
            obj, created = self.model.objects.get_or_create(**{self.field: value})
            if created:
                print(f"Object created successfully for {self.model.__name__} with {self.field}={value}")
            else:
                print(f"Object retrieved successfully for {self.model.__name__} with {self.field}={value}")
            return obj
        except Exception as e:
            print(f"Error creating/getting object for {self.model.__name__}: {e}")
            return e.args


class ProductResource(resources.ModelResource):
    # name = Field(attribute='name', column_name='Nombre Producto')
    # image = Field(attribute='image', column_name='Imagen')
    # brand = fields.Field(attribute='brand__name', column_name='Marca', widget=ForeignKeyWidget(Brand, 'name'))
    # brand = fields.Field(attribute='brand__name', column_name='Marca', widget=ForeignKeyWidget(Brand, 'name'))
    brand = fields.Field(column_name='Marca', attribute='brand',
                         widget=ForeignKeyWidgetWithCreation(Brand, field='name'))
    category = fields.Field(column_name='Categoría', attribute='category',
                            widget=ForeignKeyWidgetWithCreation(Category, field='name'))

    # purchase_price = Field(attribute='purchase_price', column_name='Precio de Compra')
    # sale_price = Field(attribute='sale_price', column_name='Precio de Venta')

    # def before_import_row(self, row, **kwargs):
    #
    #     product = Product()
    #     if Product.objects.filter(id=row["id"]).exists():
    #         product = Product.objects.get(pk=row["id"])
    #
    #     product.name = row["name"]
    #     product.category = product.get_or_create_category(name=row["Categoría"])
    #     product.brand = product.get_or_create_brand(name=row["Marca"])
    #     product.purchase_price = float(row["purchase_price"])
    #     product.sale_price = float(row["sale_price"])
    #     product.stock = int(row["stock"])
    #     product.save()

    class Meta:
        model = Product
        export_order = ('name', 'image', 'brand', 'category', 'stock', 'purchase_price', 'sale_price')
        # fields = ('id', 'name', 'image', 'brand__name', 'category__name', 'stock', 'purchase_price', 'sale_price',
        # 'status',
        #           'created_at')
        # export_order = ('id', 'name', 'image', 'brand', 'category', 'stock', 'purchase_price', 'sale_price')
        exclude = ('id', 'status', 'created_at')
