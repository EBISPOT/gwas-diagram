"""
Schema for defining the response required for the 
Ideogram.js library.
We can use "name" for rsid.
trackIndex is set for each parent trait catagory.
We could also send the parent traits and their colours/indices via the payload.
"""

from typing import Union, NamedTuple
from pydantic import BaseModel, Field
from enum import Enum


class ShapeEnum(Enum):
    circle = 'circle'
    triangle = 'triangle'
    rectangle = 'rectangle'
    narrowRectangle = 'narrow_rectangle'


class AnnotationTrack(BaseModel):
    id: int = None
    displayName: str = None
    color: str = None
    shape: ShapeEnum = 'circle'


class Annot(NamedTuple):
    name: Union[str, list] = Field(None, example="rs1")
    start: int = Field(None, example=1)
    length: int = Field(None, example=1)
    trackIndex: int = Field(None, example=1)


class ChromosomeAnnots(BaseModel):
    """Chromosome level annotations.
    annots takes a list of annotations.
    """
    chr: str = Field(None, example="10")
    annots: list[Annot] = Field(None, example=["rs1", 1, 1, 1])


class IdeogramAnnots(BaseModel):
    keys: list = ["name", "start", "length", "trackIndex"]
    annots: list[ChromosomeAnnots] = None


class Ideogram(BaseModel):
    annotations: IdeogramAnnots = None
    annotationTracks: list[AnnotationTrack] = None
