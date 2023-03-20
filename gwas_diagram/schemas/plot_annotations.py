"""
Schema for defining the response required for the 
Ideogram.js library.
"""

from typing import Union, NamedTuple
from pydantic import BaseModel, Field


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
