# Generated by Django 4.2.3 on 2023-07-29 18:54

from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('tracker', '0030_rename_activation_code_family_id'),
    ]

    operations = [
        migrations.AlterField(
            model_name='family',
            name='id',
            field=models.UUIDField(default=uuid.uuid4, primary_key=True, serialize=False),
        ),
    ]