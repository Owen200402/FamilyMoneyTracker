from django.contrib import admin
from django.db.models.aggregates import Count, Sum
from django.utils.html import format_html, urlencode
from django.urls import reverse
from . import models
from .models import Earning, Expense
from django.db.models import OuterRef, Subquery


@admin.register(models.Family)
class FamilyAdmin(admin.ModelAdmin):
    list_display = ['name', 'members_count', 'family_size', 'date_created']
    list_per_page = 8
    search_fields = ['name']

    @admin.display(ordering='members_count')
    def members_count(self, family):
        url = (
            reverse('admin:tracker_member_changelist')
            + '?'
            + urlencode({
                # or equivalently: 'family__id'
                'family': str(family.id)
            })
        )
        return format_html('<a href="{}">{}</a>', url, family.members_count)

    def get_queryset(self, request):
        return super().get_queryset(request).annotate(
            members_count=Count('member')
        )

    @admin.display(ordering='members_count')
    def family_size(self, family):
        if family.members_count <= 3:
            return 'Small'
        elif family.members_count > 3 and family.members_count <= 5:
            return 'Medium'
        else:
            return 'Large'


class MemberImageInline(admin.TabularInline):
    model = models.MemberImage
    readonly_fields = ['thumbnail']

    def thumbnail(self, instance):
        if instance.image.name != '':
            return format_html(f'<img src="{instance.image.url}" class="thumbnail" />')
        return ''


@admin.register(models.Member)
class MemberAdmin(admin.ModelAdmin):
    autocomplete_fields = ['family', 'user']
    list_display = ['first_name', 'last_name',
                    'email', 'generation', 'earnings_count', 'expenses_count', 'total_earnings', 'total_expenses', 'net_income']
    list_editable = ['generation']
    list_select_related = ['user']
    search_fields = ['user__first_name', 'user__last_name']
    list_per_page = 8
    inlines = [MemberImageInline]

    @admin.display(ordering='earnings_count')
    def earnings_count(self, member):
        url = (
            reverse('admin:tracker_earning_changelist')
            + '?'
            + urlencode({
                'member': str(member.id)
            })
        )
        return format_html('<a href="{}">{}</a>', url, member.earnings_count)

    @admin.display(ordering='expenses_count')
    def expenses_count(self, member):
        url = (
            reverse('admin:tracker_expense_changelist')
            + '?'
            + urlencode({
                'member': str(member.id)
            })
        )
        return format_html('<a href="{}">{}</a>', url, member.expenses_count)

    @admin.display(ordering='total_earnings')
    def total_earnings(self, member):
        return member.total_earnings

    @admin.display(ordering='total_expenses')
    def total_expenses(self, member):
        return member.total_expenses

    @admin.display(ordering='net_income')
    def net_income(self, member):
        return member.net_income

    def get_queryset(self, request):
        earning_subquery = Earning.objects.filter(member=OuterRef('id')).values('member_id').annotate(
            total_earnings=Sum('monetary_value')
        ).values('total_earnings')

        expense_subquery = Expense.objects.filter(member=OuterRef('id')).values('member_id').annotate(
            total_expenses=Sum('monetary_value')
        ).values('total_expenses')
 
        queryset = super().get_queryset(request).annotate(
            earnings_count=Count('earning', distinct=True),
            expenses_count=Count('expense', distinct=True),
            total_earnings=Subquery(earning_subquery),
            total_expenses=Subquery(expense_subquery),
            net_income=Subquery(earning_subquery) - Subquery(expense_subquery)
        )

        return queryset

    class Media:
        css = {
            'all': ['tracker/styles.css']
        }


@admin.register(models.Earning)
class EarningAdmin(admin.ModelAdmin):
    autocomplete_fields = ['member']
    list_display = ['title', 'received_from', 'received_date',
                    'monetary_value', 'first_name', 'last_name']
    search_fields = ['title', 'member__user__first_name',
                     'member__user__last_name']
    list_per_page = 8
    list_select_related = ['member', 'member__user']


@admin.register(models.Expense)
class ExpenseAdmin(admin.ModelAdmin):
    autocomplete_fields = ['member']
    list_display = ['title', 'paid_to', 'paid_date',
                    'monetary_value', 'first_name', 'last_name']
    search_fields = ['title', 'member__user__first_name',
                     'member__user__last_name']
    list_per_page = 8
    list_select_related = ['member', 'member__user']
