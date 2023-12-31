# Generated by Django 4.2.3 on 2023-07-27 19:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tracker', '0022_alter_earning_received_from_alter_earning_title_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='earning',
            name='monetary_value',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10),
        ),
        migrations.AlterField(
            model_name='expense',
            name='monetary_value',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10),
        ),
    ]
