# Generated by Django 5.0.1 on 2024-03-14 19:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('transactions', '0003_sale_cash_register'),
    ]

    operations = [
        migrations.AlterField(
            model_name='saledetail',
            name='cant',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=9),
        ),
    ]
