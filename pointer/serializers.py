from rest_framework import serializers
from pointer.models import Graphs, GraphDesign, PointerPlayer

class GraphSerializer(serializers.ModelSerializer):

    class Meta:
        model = Graphs
        fields = "__all__" 

class GraphDesignSerializer(serializers.ModelSerializer):

    class Meta:
        model = GraphDesign
        fields = "__all__"

class PointerPlayerSerializer(serializers.ModelSerializer):

    class Meta:
        model = PointerPlayer
        fields = "__all__"