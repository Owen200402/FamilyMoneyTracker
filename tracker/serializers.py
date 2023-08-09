from django.db import transaction
from django.utils import timezone

from rest_framework import serializers
from .models import Family, Member, Earning, Expense


class CreateFamilySerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True)
    password = serializers.CharField(write_only=True)
    date_created = serializers.DateTimeField(read_only=True, format='%Y-%m-%d')

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


class MemberRecordsSerializer(serializers.ModelSerializer):
    member_id = serializers.IntegerField(source='id', read_only=True)
    first_name = serializers.SerializerMethodField()
    last_name = serializers.SerializerMethodField()
    earning = serializers.SerializerMethodField(method_name='get_earning')
    expense = serializers.SerializerMethodField(method_name='get_expense')
    my_total_earning = serializers.SerializerMethodField(
        method_name='calculate_total_earning')
    my_total_expense = serializers.SerializerMethodField(
        method_name='calculate_total_expense')
    personal_net = serializers.SerializerMethodField(
        method_name='calculate_net')

    class Meta:
        model = Member
        fields = ['member_id', 'first_name',
                  'last_name', 'earning', 'expense', 'my_total_earning', 'my_total_expense', 'personal_net']

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

    def calculate_total_earning(self, member):
        list_earned = self.get_earning(member=member)

        net = sum([earning['monetary_value'] for earning in list_earned])

        return net

    def calculate_total_expense(self, member):
        list_expense = self.get_expense(member=member)

        net = sum([expense['monetary_value'] * -1 for expense in list_expense])

        return net

    def calculate_net(self, member):
        list_earned = self.get_earning(member=member)
        list_expense = self.get_expense(member=member)

        net = sum([earning['monetary_value'] for earning in list_earned]) + \
            sum([expense['monetary_value'] * -1 for expense in list_expense])

        return net


class FamilyEarningSerializer(serializers.ModelSerializer):
    receiver = serializers.SerializerMethodField(source='first_name')

    class Meta:
        model = Earning
        fields = ['id', 'title', 'receiver', 'received_from',
                  'received_date', 'monetary_value']

    def get_receiver(self, earning):
        return f"{earning.member.user.first_name} {earning.member.user.last_name}"


class FamilyExpenseSerializer(serializers.ModelSerializer):
    sender = serializers.SerializerMethodField(source='first_name')

    class Meta:
        model = Expense
        fields = ['id', 'title', 'sender', 'paid_to',
                  'paid_date', 'monetary_value']

    def get_sender(self, earning):
        return f"{earning.member.user.first_name} {earning.member.user.last_name}"


class FamilyRecordsSerializer(serializers.ModelSerializer):
    total_earning = serializers.SerializerMethodField()
    total_expense = serializers.SerializerMethodField()
    total_net = serializers.SerializerMethodField()

    class Meta:
        model = Family
        fields = ['name', 'member', 'total_earning',
                  'total_expense', 'total_net']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        family_pk = self.context.get('family_id')
        if family_pk:
            self.fields['member'] = MemberRecordsSerializer(
                Member.objects.select_related('user').prefetch_related('earning', 'expense').filter(family_id=family_pk), many=True)

    def get_total_earning(self, family):
        data = self.fields['member'].data

        return sum([earning['my_total_earning'] for earning in data])

    def get_total_expense(self, family):
        data = self.fields['member'].data

        return sum([earning['my_total_expense'] for earning in data])

    def get_total_net(self, family):
        data = self.fields['member'].data

        return sum([earning['my_total_earning'] for earning in data]) + sum([earning['my_total_expense'] for earning in data])
