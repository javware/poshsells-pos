# Generated by Django 5.0.1 on 2024-03-15 10:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('purchase', '0008_alter_purchasedetail_cant'),
    ]

    operations = [
        migrations.AlterField(
            model_name='purchasedetail',
            name='cant',
            field=models.DecimalField(decimal_places=4, default=0.0, max_digits=9),
        ),
    ]
