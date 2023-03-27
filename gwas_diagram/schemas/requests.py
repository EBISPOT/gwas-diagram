from fastapi import Query
from typing import Union
from enum import Enum
import numpy as np


class DataTypeEnum(str, Enum):
    traits = "traits"
    associations = "associations"


class RequestParameters:
    """Request parameter definitions
    """
    def __init__(self,
                 pmid: Union[int, None] = Query(default=None,
                                                description='Pubmed ID of a requested publication.'),
                 trait: Union[str, None] = Query(default=None,
                                                 description='Trait ontology term.'),
                 pvalue: Union[str, None] = Query(default=None,
                                                  description='Upper boundary of the p-value (eg. 1e-8).'),
                 sample: Union[str, None] = Query(default=None,
                                                  description='Part of the sample description.'),
                 ancestry: Union[str, None] = Query(default=None,
                                                    description='Broad ancestry description of the samples.'),
                 catalog_date: Union[str, None] = Query(default=None,
                                                         description='Upper boundary for the catalog publish date.',
                                                         example="2014-01-03"),
                 parent_term: Union[str, None] = Query(default=None,
                                                       description='Pipe separated list of required parent terms.'),
                 data_type: Union[DataTypeEnum, None] = Query(default=None,
                                                              description='Requested data type: "traits" or "associations".'),
                 cytological_band: Union[str, None] = Query(default=None,
                                                            description='Cytological band of the sample.')
                 ):
        self.pmid = pmid
        self.trait = trait
        self.pvalue = self._parse_pvalue(pvalue) if pvalue else None
        self.sample = sample
        self.ancestry = ancestry
        self.catalog_date = self._str_date_to_int(catalog_date) if catalog_date else None
        self.parent_term = self._split_value(parent_term) if parent_term else None
        self.data_type = data_type
        self.cytological_band = cytological_band

    @staticmethod
    def _parse_pvalue(pvalue: str) -> float:
        neglogp = None
        pvalue_lower = pvalue.lower()
        scientific = pvalue_lower.split('e')
        if len(scientific) == 2:
            neglogp = - int(scientific[1]) - np.log10(float(scientific[0]))
        else:
            neglogp = -1 * np.log10(float(pvalue))
        return neglogp

    @staticmethod
    def _split_value(value: str, delimeter: str = "|") -> list:
        return value.split(delimeter)

    @staticmethod
    def _str_date_to_int(date_str: str) -> int:
        return int(date_str.replace("/", "").replace("-", ""))
