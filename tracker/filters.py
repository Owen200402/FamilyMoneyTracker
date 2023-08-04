import django_filters
from .models import Earning, Expense, Member


class MemberEarningFilter(django_filters.FilterSet):
    year = django_filters.NumberFilter(
        field_name='received_date__year', label='Year')
    month = django_filters.NumberFilter(
        field_name='received_date__month', label='Month')

    class Meta:
        model = Earning
        fields = ['year', 'month']


class MemberExpenseFilter(django_filters.FilterSet):
    year = django_filters.NumberFilter(
        field_name='paid_date__year', label='Year')
    month = django_filters.NumberFilter(
        field_name='paid_date__month', label='Month')

    class Meta:
        model = Expense
        fields = ['year', 'month']


class FamilyEarningFilter(django_filters.FilterSet):
    year = django_filters.NumberFilter(
        field_name='received_date__year', label='Year')
    month = django_filters.NumberFilter(
        field_name='received_date__month', label='Month')

    class Meta:
        model = Earning
        fields = ['year', 'month']


class FamilyExpenseFilter(django_filters.FilterSet):
    year = django_filters.NumberFilter(
        field_name='paid_date__year', label='Year')
    month = django_filters.NumberFilter(
        field_name='paid_date__month', label='Month')

    class Meta:
        model = Expense
        fields = ['year', 'month']
