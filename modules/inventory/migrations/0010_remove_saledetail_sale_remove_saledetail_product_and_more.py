# Generated by Django 5.0.1 on 2024-01-17 00:10

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('inventory', '0009_alter_cashregister_status_sale_saledetail'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='saledetail',
            name='sale',
        ),
        migrations.RemoveField(
            model_name='saledetail',
            name='product',
        ),
        migrations.DeleteModel(
            name='Sale',
        ),
        migrations.DeleteModel(
            name='SaleDetail',
        ),
    ]
