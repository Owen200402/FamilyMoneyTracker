from djoser.serializers import UserCreateSerializer as BaseUserCreateSerializer
from djoser.serializers import UserSerializer as BaseUserSerializer

from rest_framework import serializers


class UserCreateSerializer(BaseUserCreateSerializer):
    user_id = serializers.IntegerField(source='id', read_only=True)
    class Meta(BaseUserCreateSerializer.Meta):
        fields = ['user_id', 'username', 'password', 'email',
                  'first_name', 'last_name']


class UserSerializer(BaseUserSerializer):
    user_id = serializers.IntegerField(source='id')
    class Meta(BaseUserSerializer.Meta):
        fields = ['user_id', 'username', 'email', 'first_name', 'last_name']
