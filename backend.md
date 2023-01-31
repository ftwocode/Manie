#   Copiar e colar os as instrucoes abaixo em `requirements.txt`

    asgiref==3.4.1   
    autopep8==1.6.0   
    Django==4.0.1   
    django-cors-headers==3.11.0   
    djangorestframework==3.13.1   
    djangorestframework-simplejwt==5.0.0   
    pycodestyle==2.8.0   
    PyJWT= =2.3.0   
    pytz==2021.3   
    sqlparse==0.4.2   
    toml==0.10.2   
    tzdata==2021.5

com a pasta backend aberta no terminal executar os comandos abaixo

    pip install -r requirements.txt 
    django-admin.py startproject core .
    python manage.py startapp api
    python manage.py migrate
    python manage.py runserver


-   Digite `Ctrl+C` para parar o servidor django
-   Crie um arquivo na pasta `api` chamado `serializer.py` ou digite:

        touch api/serializer.py

###  Copie e cole os codigos abaixo:

    # api/serializer.py
    from django.contrib.auth.models import User
    from django.contrib.auth.password_validation import validate_password
    from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
    from rest_framework import serializers
    from rest_framework.validators import UniqueValidator
    from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

    class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
        @classmethod
        def get_token(cls, user):
            token = super().get_token(user)
            # Add custom claims
            token['username'] = user.username
            token['email'] = user.email
            # ...
            return token

    class RegisterSerializer(serializers.ModelSerializer):
        password = serializers.CharField(
            write_only=True, required=True, validators=[validate_password])
        password2 = serializers.CharField(write_only=True, required=True)

        class Meta:
            model = User
            fields = ('username', 'password', 'password2')

        def validate(self, attrs):
            if attrs['password'] != attrs['password2']:
                raise serializers.ValidationError(
                    {"password": "Password fields didn't match."})

            return attrs

        def create(self, validated_data):
            user = User.objects.create(
                username=validated_data['username']
            )

            user.set_password(validated_data['password'])
            user.save()

            return user


-   Crie um arquivo na pasta `api` chamado `urls.py` ou digite:

        touch api/urls.py

###  Copie e cole os codigos abaixo:

    # api/urls.py

    from django.urls import path
    from . import views

    from rest_framework_simplejwt.views import (
        TokenRefreshView,
    )

    urlpatterns = [
        path('token/', views.MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
        path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
        path('register/', views.RegisterView.as_view(), name='auth_register'),
        path('', views.getRoutes)
    ]


###  Copie e cole os codigos abaixo para o ficheiro `api/views.py`:

    # api/views.py
    from django.shortcuts import render
    from rest_framework.decorators import api_view
    from rest_framework.response import Response
    from django.http import JsonResponse
    from api.serializer import MyTokenObtainPairSerializer, RegisterSerializer
    from rest_framework_simplejwt.views import TokenObtainPairView
    from rest_framework import generics
    from django.contrib.auth.models import User
    from rest_framework.permissions import AllowAny, IsAuthenticated

    # Create your views here.

    class MyTokenObtainPairView(TokenObtainPairView):
        serializer_class = MyTokenObtainPairSerializer

    class RegisterView(generics.CreateAPIView):
        queryset = User.objects.all()
        permission_classes = (AllowAny,)
        serializer_class = RegisterSerializer


    @api_view(['GET'])
    def getRoutes(request):
        routes = [
            '/api/token/',
            '/api/register/',
            '/api/token/refresh/'
        ]
        return Response(routes)


###  Copie e cole os codigos abaixo para o ficheiro `core/urls.py`:

# project_name/urls.py (In my case core/urls.py)

    from django.contrib import admin
    from django.urls import path
    from django.urls import path, include

        urlpatterns = [
            path('admin/', admin.site.urls),
            path('api/', include("api.urls"))
        ]