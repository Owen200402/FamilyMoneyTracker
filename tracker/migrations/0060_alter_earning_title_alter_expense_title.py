# Generated by Django 4.2.4 on 2023-08-27 01:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tracker', '0059_alter_earning_title_alter_expense_title'),
    ]

    operations = [
        migrations.AlterField(
            model_name='earning',
            name='title',
            field=models.CharField(max_length=25),
        ),
        migrations.AlterField(
            model_name='expense',
            name='title',
            field=models.CharField(max_length=25),
        ),
    ]
