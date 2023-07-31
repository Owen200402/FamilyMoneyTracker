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

    def first_name(self, member):
        return member.user.first_name

    def last_name(self, member):
        return member.user.last_name

    class Meta:
        model = Member
        fields = ['member_id', 'first_name', 'last_name', 'generation']


class AddMemberToFamilySerializer(serializers.ModelSerializer):
    member_id = serializers.IntegerField(source='id')

    def validate_member_id(self, value):
        if not Member.objects.filter(pk=value).exists():
            raise serializers.ValidationError(
                'No member with the given ID was found.')
        return value

    def save(self, **kwargs):
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

    class Meta:
        model = Member
        fields = ['member_id']
