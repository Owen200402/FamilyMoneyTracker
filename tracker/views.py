from rest_framework import status
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import action
from rest_framework.filters import SearchFilter
from rest_framework.mixins import CreateModelMixin, DestroyModelMixin, RetrieveModelMixin, UpdateModelMixin
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet, GenericViewSet, ReadOnlyModelViewSet

from tracker.filters import FamilyEarningFilter, FamilyExpenseFilter, MemberEarningFilter, MemberExpenseFilter

from .models import Family, Member, Earning, Expense
from .serializers import AddMemberToFamilySerializer, CreateFamilySerializer, FamilyEarningSerializer, FamilyExpenseSerializer, FamilyRecordsSerializer, MemberEarningSerializer, MemberExpenseSerializer, MemberInfoSerializer, MemberRecordsSerializer, MemberSerializer, UpdateFamilySerializer, UnlinkMemberSerializer


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
    permission_classes = [IsAuthenticated]

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
        return Member.objects.select_related('user').filter(family_id=self.kwargs['family_pk'])

    def get_serializer_class(self):
        if self.action == 'unlink_member':
            return UnlinkMemberSerializer
        if self.request.method == 'GET' or self.request.method == 'PUT':
            return MemberSerializer
        else:
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
            'message': f'Succesffuly unlinked Member {member.user.first_name} {member.user.last_name} from the family.',
        }, status=status.HTTP_200_OK)


class MemberEarningViewSet(ModelViewSet):
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_class = MemberEarningFilter
    serializer_class = MemberEarningSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Earning.objects.filter(member_id=self.kwargs['member_pk'])

    def get_serializer_context(self):
        return {'member_id': self.kwargs['member_pk']}


class MemberExpenseViewSet(ModelViewSet):
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_class = MemberExpenseFilter
    serializer_class = MemberExpenseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Expense.objects.filter(member_id=self.kwargs['member_pk'])

    def get_serializer_context(self):
        return {'member_id': self.kwargs['member_pk']}


# An example of manual filtering: ?earning__received_date__month=9&expense__paid_date__month=6
class MemberRecordsViewSet(ReadOnlyModelViewSet):
    filter_backends = [DjangoFilterBackend]
    serializer_class = MemberRecordsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        member_id = self.kwargs['member_pk']
        queryset = Member.objects.filter(id=member_id)

        return queryset

    def get_serializer_context(self):
        return {'request': self.request}


class FamilyEarningViewSet(ReadOnlyModelViewSet):
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_class = FamilyEarningFilter
    serializer_class = FamilyEarningSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Earning.objects.filter(member__family_id=self.kwargs['family_pk'])


class FamilyExpenseViewSet(ReadOnlyModelViewSet):
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_class = FamilyExpenseFilter
    serializer_class = FamilyExpenseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Expense.objects.filter(member__family_id=self.kwargs['family_pk'])

# An example of manual filtering: ?earning__received_date__month=9&expense__paid_date__month=6
class FamilyRecordsViewset(ReadOnlyModelViewSet):
    filter_backends = [DjangoFilterBackend]
    serializer_class = FamilyRecordsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Family.objects.filter(id=self.kwargs['family_pk'])

        return queryset

    def get_serializer_context(self):
        return {'family_id': self.kwargs['family_pk'],'request': self.request}
