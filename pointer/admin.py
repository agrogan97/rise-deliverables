from django.contrib import admin
from pointer.models import Graphs, GraphDesign, PointerPlayer

# Register your models here.

# @admin.register(LevelConfig)
# class LevelConfigAdmin(admin.ModelAdmin):

#         list_display = ('pk', 'conceptLevel', 'strategyLevel', 'checked')

@admin.register(Graphs)
class GraphsAdmin(admin.ModelAdmin):
        class Meta:
                # name = "Graph"
                verbose_name = "Graph"
                verbose_name_plural = "Graphs"
        
        list_display = ('pk', 'givenName')


@admin.register(PointerPlayer)
class PlayerAdmin(admin.ModelAdmin):

        list_display = ('pk', 'UserId', 'Source', 'timeCreated')

@admin.register(GraphDesign)
class GraphDesignAdmin(admin.ModelAdmin):

        list_display = ('pk', 'givenName', 'level', 'confirmed')