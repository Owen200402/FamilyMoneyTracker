import django_filters
from .models import Earning, Expense, Member


class EarningFilter(django_filters.FilterSet):
    year = django_filters.NumberFilter(
        field_name='received_date__year', label='Year')
    month = django_filters.NumberFilter(
        field_name='received_date__month', label='Month')

    class Meta:
        model = Earning
        fields = ['year', 'month']


class ExpenseFilter(django_filters.FilterSet):
    year = django_filters.NumberFilter(
        field_name='paid_date__year', label='Year')
    month = django_filters.NumberFilter(
        field_name='paid_date__month', label='Month')

    class Meta:
        model = Expense
        fields = ['year', 'month']


class NetFilter(django_filters.FilterSet):
    earning__received_date__year = django_filters.NumberFilter(
        field_name='earning__received_date__year', label='Year Received')
    earning__received_date__month = django_filters.NumberFilter(
        field_name='earning__received_date__month', label='Month Received')
    expense__paid_date__year = django_filters.NumberFilter(
        field_name='expense__paid_date__year', label='Year Paid')
    expense__paid_date__month = django_filters.NumberFilter(
        field_name='expense__paid_date__month', label='Month Paid')

    class Meta:
        model = Member
        fields = ['earning__received_date__year', 'earning__received_date__month',
                  'expense__paid_date__year', 'expense__paid_date__month']
