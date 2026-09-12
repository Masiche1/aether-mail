from django.contrib.auth import login, logout
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import LoginSerializer, RegisterSerializer, UserSerializer
from organizations.models import Organization, OrganizationMembership, Role


class RegisterView(APIView):
	permission_classes = [AllowAny]

	def post(self, request):
		serializer = RegisterSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		user = serializer.save()
		organization = Organization.objects.create(name=f'{user.username}\'s Organization', slug=f'user-{user.pk}')
		OrganizationMembership.objects.create(user=user, organization=organization, role=Role.OWNER)
		token, _ = Token.objects.get_or_create(user=user)
		return Response({'token': token.key, 'user': UserSerializer(user).data}, status=status.HTTP_201_CREATED)


class LoginView(APIView):
	permission_classes = [AllowAny]

	def post(self, request):
		serializer = LoginSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		user = serializer.validated_data['user']
		login(request, user)
		token, _ = Token.objects.get_or_create(user=user)
		return Response({'token': token.key, 'user': UserSerializer(user).data})


class LogoutView(APIView):
	permission_classes = [IsAuthenticated]

	def post(self, request):
		Token.objects.filter(user=request.user).delete()
		logout(request)
		return Response(status=status.HTTP_204_NO_CONTENT)


class MeView(APIView):
	permission_classes = [IsAuthenticated]

	def get(self, request):
		return Response(UserSerializer(request.user).data)
