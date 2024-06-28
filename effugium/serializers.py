from rest_framework import serializers
from effugium.models import RawLevelData, PlayerData, Config

class RawLevelDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = RawLevelData
        fields = '__all__'

class PlayerDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlayerData
        fields = "__all__"

class ConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = Config
        fields = "__all__"