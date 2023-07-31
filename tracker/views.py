from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.mixins import CreateModelMixin, DestroyModelMixin, RetrieveModelMixin, UpdateModelMixin
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet, GenericViewSet

from .models import Family, Member, Earning, Expense
from .serializers import AddMemberToFamilySerializer, CreateFamilySerializer, MemberInfoSerializer, MemberSerializer, UpdateFamilySerializer
from tracker import serializers


class FamilyViewSet(CreateModelMixin, RetrieveModelMixin, UpdateModelMixin, GenericViewSet):
    http_method_names = ['get', 'post', 'patch']
    serializer_class = CreateFamilySerializer
    queryset = Family.objects.all()

    def get_serializer_class(self):
        if self.request.method == 'POST' or self.request.method == 'GET':
            return CreateFamilySerializer
        if self.request.method == 'PATCH':
            return UpdateFamilySerializer


class MemberInfoViewSet(CreateModelMixin, RetrieveModelMixin, UpdateModelMixin, GenericViewSet):
    http_method_names = ['get']
    serializer_class = MemberInfoSerializer
    queryset = Member.objects.all()

    @action(detail=False, methods=['GET'], permission_classes=[IsAuthenticated])
    def me(self, request):
        member = Member.objects.get(user_id=request.user.id)
        serializer = MemberInfoSerializer(member)
        return Response(serializer.data)


class MemberViewSet(ModelViewSet):
    http_method_names = ['get', 'put', 'post']
    serializer_class = MemberSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Member.objects.filter(family_id=self.kwargs['family_pk'])

    def get_serializer_class(self):
        if self.request.method == 'GET' or self.request.method == 'PUT':
            return MemberSerializer
        if self.request.method == 'POST':
            return AddMemberToFamilySerializer

    def create(self, request, *args, **kwargs):
        serializer = AddMemberToFamilySerializer(data=request.data, context={
            'family_id': self.kwargs['family_pk']})
        serializer.is_valid(raise_exception=True)
        member = serializer.save()

        return Response({
            'message': f'Successfully linked member {member.user.first_name} {member.user.last_name} to the family.',
            'linked_member_id': member.id
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['PUT'], url_path='unlink-member', permission_classes=[IsAuthenticated])
    def unlink_member(self, request, *args, **kwargs):
        member = self.get_object()
        member.family = None
        member.save()

        return Response({
            'message': f'Member {member.user.first_name} {member.user.last_name} unlinked from the family.',
        }, status=status.HTTP_200_OK)
