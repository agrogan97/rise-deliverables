from django.db import models

class Graphs(models.Model):
    class Meta: 
        verbose_name = "Graphs"
        verbose_name_plural = "Graphs"
    # Note that in the DB we'll just store our simple dicts as char rather than using the Django JSONField
    givenName = models.CharField(max_length=64, unique=True)  
    curriculumLevel = models.IntegerField()
    difficultyLevel = models.IntegerField()
    nodes = models.CharField(max_length=4096)
    scores = models.CharField(max_length=4096)

class GraphDesign(models.Model):
    # It's helpful to have a separate set of models that are used for testing and development
    givenName = models.CharField(max_length=64, unique=True)
    level = models.IntegerField()
    nodes = models.CharField(max_length=4096)
    scores = models.CharField(max_length=4096)
    notes = models.TextField(max_length=4096, blank=True, null=True)
    confirmed = models.BooleanField(default=False)

class PointerPlayer(models.Model):
    class Meta:
        verbose_name = "Player"

    UserId = models.CharField(max_length=256)
    RawData = models.JSONField(blank=True, null=True, default=list)
    Source = models.CharField(max_length=64)
    IP = models.CharField(max_length=64, blank=True)
    platformData = models.JSONField(blank=True, null=True, default=dict)
    Metadata = models.JSONField(blank=True, null=True, default=dict)
    timeCreated = models.DateTimeField(auto_now_add=True)
    lastModified = models.DateTimeField(auto_now=True)