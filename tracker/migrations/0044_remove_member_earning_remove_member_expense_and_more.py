# Generated by Django 4.2.3 on 2023-08-01 19:01

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('tracker', '0043_remove_member_earning_remove_member_expense_and_more'),
    ]

    operations = [
        # migrations.RemoveField(
        #     model_name='member',
        #     name='earning',
        # ),
        # migrations.RemoveField(
        #     model_name='member',
        #     name='expense',
        # ),
        # migrations.AddField(
        #     model_name='earning',
        #     name='member',
        #     field=models.ForeignKey(default=2, on_delete=django.db.models.deletion.CASCADE, related_name='earning', to='tracker.member'),
        #     preserve_default=False,
        # ),
        # migrations.AddField(
        #     model_name='expense',
        #     name='member',
        #     field=models.ForeignKey(default=2, on_delete=django.db.models.deletion.CASCADE, related_name='expense', to='tracker.member'),
        #     preserve_default=False,
        # ),
    ]
