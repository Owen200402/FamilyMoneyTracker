from django.db import transaction
from django.utils import timezone

from rest_framework import serializers
from .models import Family, Member, Earning, Expense


class CreateFamilySerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True)
    password = serializers.CharField(write_only=True)
    date_created = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Family
        fields = ['id', 'name', 'password', 'date_created']


class UpdateFamilySerializer(serializers.ModelSerializer):
    class Meta:
        model = Family
        fields = ['name']


class MemberInfoSerializer(serializers.ModelSerializer):
    member_id = serializers.IntegerField(source='id')

    class Meta:
        model = Member
        fields = ['member_id', 'generation', 'family_id']
        read_only_fields = ['member_id', 'family_id']


class MemberSerializer(serializers.ModelSerializer):
    member_id = serializers.IntegerField(source='id', read_only=True)
    first_name = serializers.SerializerMethodField()
    last_name = serializers.SerializerMethodField()

    class Meta:
        model = Member
        fields = ['member_id', 'first_name', 'last_name', 'generation']

    def first_name(self, member):
        return member.user.first_name

    def last_name(self, member):
        return member.user.last_name


class AddMemberToFamilySerializer(serializers.ModelSerializer):
    member_id = serializers.IntegerField(source='id')

    class Meta:
        model = Member
        fields = ['member_id']

    def validate_member_id(self, value):
        if not Member.objects.filter(pk=value).exists():
            raise serializers.ValidationError(
                'No member with the given ID was found.')
        return value

    def save(self, **kwargs):
        with transaction.atomic():
            family_id = self.context['family_id']
            id = self.validated_data['id']

            try:
                member = Member.objects.get(id=id)
                if member.family_id == None:
                    member.family_id = family_id
                    member.save()
                    self.instance = member
                    return self.instance
                else:
                    print("Wrong")
                    raise serializers.ValidationError(
                        f'Adding failed: {member.user.first_name} {member.user.last_name} has already been linked to a family')
            except Member.DoesNotExist:
                raise serializers.ValidationError(
                    'Adding failed: Member with the given ID does not exist.')


class UnlinkMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = ['id']


class MemberEarningSerializer(serializers.ModelSerializer):
    class Meta:
        model = Earning
        fields = ['id', 'title', 'received_from',
                  'received_date', 'monetary_value']

    def save(self, **kwargs):
        earning = Earning.objects.create(
            member_id=self.context['member_id'], **self.validated_data)
        return earning


class MemberExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = ['id', 'title', 'paid_to',
                  'paid_date', 'monetary_value']

    def save(self, **kwargs):
        earning = Expense.objects.create(
            member_id=self.context['member_id'], **self.validated_data)
        return earning


class MemberNetSerializer(serializers.ModelSerializer):
    member_id = serializers.IntegerField(source='id', read_only=True)
    first_name = serializers.SerializerMethodField()
    last_name = serializers.SerializerMethodField()
    earning = serializers.SerializerMethodField()
    expense = serializers.SerializerMethodField()

    class Meta:
        model = Member
        fields = ['member_id', 'first_name',
                  'last_name', 'earning', 'expense', 'net']

    net = serializers.SerializerMethodField(method_name='calculate_net')

    def first_name(self, member):
        return member.user.first_name

    def last_name(self, member):
        return member.user.last_name

    def get_earning(self, member):
        year = self.context['request'].query_params.get(
            'earning__received_date__year')
        month = self.context['request'].query_params.get(
            'earning__received_date__month')
        queryset = member.earning.all()

        if year:
            queryset = queryset.filter(received_date__year=year)
        if month:
            queryset = queryset.filter(received_date__month=month)
        return MemberEarningSerializer(queryset, many=True).data

    def get_expense(self, member):
        year = self.context['request'].query_params.get(
            'expense__paid_date__year')
        month = self.context['request'].query_params.get(
            'expense__paid_date__month')
        queryset = member.expense.all()

        if year:
            queryset = queryset.filter(paid_date__year=year)
        if month:
            queryset = queryset.filter(paid_date__month=month)
        return MemberExpenseSerializer(queryset, many=True).data

    def calculate_net(self, member):
        list_earned = self.get_earning(member=member)
        list_expense = self.get_expense(member=member)

        net = 0
        for earning in list_earned:
            net += earning['monetary_value']

        for expense in list_expense:
            net -= expense['monetary_value']

        return net
