from django.conf import settings
from django.contrib import admin
from django.db import models
from django.utils import timezone
import uuid

from tracker.validators import validate_file_size


class Family(models.Model):
    id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=30)
    password = models.CharField(max_length=20)
    date_created = models.DateTimeField(
        default=timezone.now)

    def __str__(self) -> str:
        return self.name

    class Meta:
        ordering = ['name']
        verbose_name = 'Family'
        verbose_name_plural = 'Families'


class Member(models.Model):
    GENERATION_GRAND_PARENT = 'G'
    GENERATION_PARENT = 'P'
    GENERATION_CHILD = 'C'

    GENERATION_CHOICES = [
        (GENERATION_GRAND_PARENT, 'Grand Parent'),
        (GENERATION_PARENT, 'Parent'),
        (GENERATION_CHILD, 'Child')
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='member')
    generation = models.CharField(
        max_length=1, choices=GENERATION_CHOICES, default=GENERATION_PARENT)
    family = models.ForeignKey(
        Family, on_delete=models.PROTECT, null=True, blank=True, related_name='member')

    @admin.display(ordering='user__first_name')
    def first_name(self):
        return self.user.first_name

    @admin.display(ordering='user__last_name')
    def last_name(self):
        return self.user.last_name

    @admin.display()
    def email(self):
        return self.user.email

    def __str__(self) -> str:
        return f"{self.user.first_name}, {self.user.last_name}"

    class Meta:
        ordering = ['user__first_name', 'user__last_name']

class MemberImage(models.Model):
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='tracker/images', validators=[validate_file_size])

class Earning(models.Model):
    title = models.CharField(max_length=30)
    received_from = models.CharField(max_length=40)
    received_date = models.DateField(auto_now_add=False)
    monetary_value = models.DecimalField(
        max_digits=10, decimal_places=2, default=0)
    member = models.ForeignKey(
        Member, on_delete=models.CASCADE, related_name='earning')

    def __str__(self) -> str:
        return self.title

    @admin.display(ordering='member__user__first_name')
    def first_name(self):
        return self.member.user.first_name

    @admin.display(ordering='member__user__last_name')
    def last_name(self):
        return self.member.user.last_name

    class Meta:
        ordering = ['received_from']


class Expense(models.Model):
    title = models.CharField(max_length=30)
    paid_to = models.CharField(max_length=40)
    paid_date = models.DateField(auto_now_add=False)
    monetary_value = models.DecimalField(
        max_digits=10, decimal_places=2, default=0)
    member = models.ForeignKey(
        Member, on_delete=models.CASCADE, related_name='expense')

    def __str__(self) -> str:
        return self.title

    @admin.display(ordering='member__user__first_name')
    def first_name(self):
        return self.member.user.first_name

    @admin.display(ordering='member__user__last_name')
    def last_name(self):
        return self.member.user.last_name

    class Meta:
        ordering = ['paid_date']
