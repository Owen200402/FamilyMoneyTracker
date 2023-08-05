from djoser.serializers import UserCreateSerializer as BaseUserCreateSerializer
from djoser.serializers import UserSerializer as BaseUserSerializer

from rest_framework import serializers


class UserCreateSerializer(BaseUserCreateSerializer):
    class Meta(BaseUserCreateSerializer.Meta):
        fields = ['username', 'password', 'email',
                  'first_name', 'last_name']


class UserSerializer(BaseUserSerializer):
    user_id = serializers.IntegerField(source='id')
    class Meta(BaseUserSerializer.Meta):
        fields = ['user_id', 'username', 'email', 'first_name', 'last_name']
