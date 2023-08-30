from rest_framework import status
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import action
from rest_framework.filters import SearchFilter
from rest_framework.mixins import CreateModelMixin, RetrieveModelMixin, UpdateModelMixin
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet, GenericViewSet, ReadOnlyModelViewSet

from tracker.filters import FamilyEarningFilter, FamilyExpenseFilter, MemberEarningFilter, MemberExpenseFilter

from .models import Family, Member, Earning, Expense, MemberImage
from .permission import LinkMemberPermission, ViewItemInOwnFamilyOnly
from .serializers import AddMemberToFamilySerializer, CreateFamilySerializer, EmptySerializer, FamilyEarningSerializer, FamilyExpenseSerializer, FamilyRecordsSerializer, MemberEarningSerializer, MemberEarningUpdateSerializer, MemberExpenseSerializer, MemberExpenseUpdateSerializer, MemberImageSerializer, MemberInfoSerializer, MemberRecordsSerializer, MemberSerializer, UpdateFamilySerializer, UnlinkMemberSerializer


class FamilyViewSet(CreateModelMixin, RetrieveModelMixin, UpdateModelMixin, GenericViewSet):
    http_method_names = ['get', 'post', 'patch']
    serializer_class = CreateFamilySerializer
    queryset = Family.objects.all()
    lookup_url_kwarg = 'pk'
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST' or self.request.method == 'GET':
            return CreateFamilySerializer
        if self.request.method == 'PATCH':
            current_family_id = self.request.user.member.family_id
            if current_family_id == None or str(current_family_id) != self.kwargs[self.lookup_url_kwarg]:
                return EmptySerializer
            return UpdateFamilySerializer

    def get_permission_context(self):
        return {'family_id': self.kwargs[self.lookup_url_kwarg]}


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

    def get_queryset(self):
        return Member.objects.select_related('user').prefetch_related('images').filter(family_id=self.kwargs['family_pk'])

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
    http_method_names = ['get', 'delete', 'patch', 'post']
    serializer_class = MemberEarningSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Earning.objects.filter(member_id=self.kwargs['member_pk'])

    def get_serializer_class(self):
        if self.request.method == 'PATCH':
            return MemberEarningUpdateSerializer
        else:
            return MemberEarningSerializer

    def get_permissions(self):
        if self.action in ['list', 'create', 'retrieve']:
            permission_classes = [LinkMemberPermission,
                                  IsAuthenticated, ViewItemInOwnFamilyOnly]
        else:
            permission_classes = self.permission_classes

        return [permission() for permission in permission_classes]

    def get_serializer_context(self):
        return {'member_id': self.kwargs['member_pk']}


class MemberExpenseViewSet(ModelViewSet):
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_class = MemberExpenseFilter
    serializer_class = MemberExpenseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Expense.objects.filter(member_id=self.kwargs['member_pk'])

    def get_serializer_class(self):
        if self.request.method == 'PATCH':
            return MemberExpenseUpdateSerializer
        else:
            return MemberExpenseSerializer

    def get_permissions(self):
        if self.action in ['list', 'create', 'retrieve']:
            permission_classes = [LinkMemberPermission,
                                  IsAuthenticated, ViewItemInOwnFamilyOnly]
        else:
            permission_classes = self.permission_classes

        return [permission() for permission in permission_classes]

    def get_serializer_context(self):
        return {'member_id': self.kwargs['member_pk']}


class MemberRecordsViewSet(ReadOnlyModelViewSet):
    filter_backends = [DjangoFilterBackend]
    serializer_class = MemberRecordsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        member_id = self.kwargs['member_pk']
        queryset = Member.objects.prefetch_related(
            'earning', 'expense').filter(id=member_id)

        return queryset

    def get_permissions(self):
        if self.action in ['list', 'create', 'retrieve']:
            permission_classes = [LinkMemberPermission,
                                  IsAuthenticated, ViewItemInOwnFamilyOnly]
        else:
            permission_classes = self.permission_classes

        return [permission() for permission in permission_classes]

    def get_serializer_context(self):
        return {'request': self.request}


class FamilyEarningViewSet(ReadOnlyModelViewSet):
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_class = FamilyEarningFilter
    serializer_class = FamilyEarningSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Earning.objects.select_related('member').filter(member__family_id=self.kwargs['family_pk'])

    def get_permissions(self):
        if self.action in ['list', 'create', 'retrieve']:
            permission_classes = [LinkMemberPermission,
                                  IsAuthenticated, ViewItemInOwnFamilyOnly]
        else:
            permission_classes = self.permission_classes

        return [permission() for permission in permission_classes]


class FamilyExpenseViewSet(ReadOnlyModelViewSet):
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_class = FamilyExpenseFilter
    serializer_class = FamilyExpenseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Expense.objects.select_related('member').filter(member__family_id=self.kwargs['family_pk'])

    def get_permissions(self):
        if self.action in ['list', 'create', 'retrieve']:
            permission_classes = [LinkMemberPermission,
                                  IsAuthenticated, ViewItemInOwnFamilyOnly]
        else:
            permission_classes = self.permission_classes

        return [permission() for permission in permission_classes]


class FamilyRecordsViewset(ReadOnlyModelViewSet):
    filter_backends = [DjangoFilterBackend]
    serializer_class = FamilyRecordsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        family_id = self.kwargs['family_pk']
        queryset = Family.objects.prefetch_related(
            'member__earning', 'member__expense', 'member__user').filter(id=family_id)

        return queryset

    def get_permissions(self):
        if self.action in ['list', 'create', 'retrieve']:
            permission_classes = [LinkMemberPermission,
                                  IsAuthenticated, ViewItemInOwnFamilyOnly]
        else:
            permission_classes = self.permission_classes

        return [permission() for permission in permission_classes]

    def get_serializer_context(self):
        return {'family_id': self.kwargs['family_pk'], 'request': self.request}


class MemberImageViewSet(ModelViewSet):
    serializer_class = MemberImageSerializer

    def get_queryset(self):
        return MemberImage.objects.filter(member_id=self.kwargs['member_pk'])

    def get_serializer_context(self):
        return {'member_id': self.kwargs['member_pk']}

    def paginate_queryset(self, queryset):
        return None
