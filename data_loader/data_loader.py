
import logging
import os
import pickle

import numpy as np
import pandas as pd

class DataLoader:
    """ This function loads and manages the GWAS association data."""

    # Default gwas_file name:
    GWAS_DATA_PICKLE_FILE = os.path.dirname(os.path.realpath(__file__)) + '/pooled_terms.pkl'

    def __init__(self, parent_mapping_file: str, association_file: str, ancestry_file: str) -> None:

        # Store input:
        self.parent_mapping_file = parent_mapping_file
        self.association_file = association_file
        self.ancestry_file = ancestry_file

        # Load the association data if the file exists:
        try:
            logging.info('Pooled data was found ({}). Loading...'.format(self.GWAS_DATA_PICKLE_FILE))
            pooled_terms = pickle.load(open(self.GWAS_DATA_PICKLE_FILE, "rb"))
            self.pooled_terms = pooled_terms

        except FileNotFoundError:

            # Downloading and filtering data:
            logging.info(f'Downloading parent file: {self.parent_mapping_file}.')
            self.parent_mapping_df = self.get_parent_dataframe()

            logging.info(f'Downloading association file: {self.association_file}.')
            self.association_df = self.get_association_dataframe()

            logging.info(f'Downloading ancestry file: {self.ancestry_file}.')
            self.ancestry_df = self.get_ancestry_dataframe()

            # Pool associations with parent terms:
            logging.info('Joining data...')
            self.pooled_terms = self.pool_dataframes()

            # saving data into a pickled file:
            logging.info('Saving pickle file.')
            pickle.dump(pooled_terms, open(self.pooled_data_file, "wb"))    

    def get_data(self) -> pd.DataFrame:
        """Returns the association as a dataframe."""
        return self.association_df

    def get_parent_dataframe(self) -> pd.DataFrame:
        """Getting a mapping of EFO terms to their parent terms.

        Args:
            parent_mapping_file (str): Path to the file containing the parent mapping.
        Returns:
            pd.DataFrame: A dataframe containing the parent mapping.
        """

        # Get a list of columns we want to filter the data in the future:
        columns_to_extract = ['EFO URI', 'Parent term']

        # Downloading EFO mapping file:
        parent_mapping_df = pd.read_csv(parent_mapping_file, sep='\t')

        try:
            parent_mapping_df = parent_mapping_df[columns_to_extract]
        except KeyError:
            raise('[Error] The parent mapping data frame does not have some of the required columns ({}).'.format(
                ','.join(columns_to_extract)))

        # Filter out onlyt the required fields:
        parent_mapping_df = parent_mapping_df[['EFO URI', 'Parent term']].drop_duplicates()

        # Rename columns:
        parent_mapping_df.rename(columns={'EFO URI': 'EFO_URI',
                                        'Parent term': 'EFO_PARENT'})

        return parent_mapping_df


    def get_association_dataframe(self) -> pd.DataFrame:
        """ Fetching and formatting association data.

        Args:
            association_file (str): Path to the file containing the association data.
        Returns:
            pd.DataFrame: A dataframe containing the association data.
        """

        # Downloading associations:
        association_df = pd.read_csv(association_file, sep='\t', dtype=str)

        # Get a list of columns we want to filter the data in the future:
        columns_to_extract = ['DATE ADDED TO CATALOG', 'PUBMEDID',
                            'REGION', 'CHR_ID', 'DISEASE/TRAIT',
                            'MAPPED_GENE', 'SNP_GENE_IDS',
                            'SNPS', 'CHR_POS', 'MAPPED_TRAIT',
                            'CONTEXT', 'INTERGENIC', 'INITIAL SAMPLE SIZE',
                            'REPLICATION SAMPLE SIZE',
                            'PVALUE_MLOG', 'MAPPED_TRAIT_URI', 'STUDY ACCESSION']

        # Filtering columns:
        association_df = association_df[columns_to_extract]

        # Filtering rows criteria:

        # Exclude associations without genomic mapping:
        association_df = association_df.loc[~association_df.REGION.isna()]

        # Excluding associations without mapped trait:
        association_df = association_df[~association_df.MAPPED_TRAIT_URI.isna()]

        # Excluding associations below 5e-8:
        association_df.PVALUE_MLOG = association_df.PVALUE_MLOG.astype('float')
        association_df = association_df.loc[association_df.PVALUE_MLOG > -np.log10(5e-8)]

        # Exclude association with multiple snps: <- this criteria might be too harsh
        association_df = association_df.loc[~association_df.CHR_POS.str.contains(';')]
        association_df = association_df.loc[~association_df.CHR_POS.str.contains('x')]

        # Convert positions to int:
        association_df.CHR_POS = association_df.CHR_POS.astype('int64')

        # Split EFO trait column and explode:
        association_df = (
            association_df
            .assign(MAPPED_TRAIT_URI=lambda df: df.MAPPED_TRAIT_URI.str.split(', '))
            .explode('MAPPED_TRAIT_URI')
        )

        # Pool initial and replication sample description:
        association_df['SAMPLE_DESCRIPTION'] = association_df.apply(
            lambda row: '{} {}'.format(row['INITIAL SAMPLE SIZE'], row['REPLICATION SAMPLE SIZE']), axis=1)

        # Convert date columns into integers: <- why do we need this?
        association_df['CATALOG_DATE'] = association_df['DATE ADDED TO CATALOG'].apply(lambda x: int(x.replace("-", "")))

        return association_df


    def get_ancestry_dataframe(self) -> pd.DataFrame:
        """ Fetching and formatting ancestry data.

        Args:
            ancestry_file (str): Path to the file containing the ancestry data.
        Returns:
            pd.DataFrame: A dataframe containing the ancestry data.
        """

        # Columns to extract:
        ancestry_columns = ['STUDY ACCESSION', 'BROAD ANCESTRAL CATEGORY']

        # Download ancestry data:
        ancestry_df = pd.read_csv(ancestry_file, sep="\t", index_col=False, usecols=ancestry_columns)

        return ancestry_df


    def pool_dataframes(self) -> pd.DataFrame:

        # Adding parent term to all rows:
        pooled_df = association_df.merge(parent_mapping_df, how='left', left_on='MAPPED_TRAIT_URI', right_on='EFO_URI')

        # Adding ancestry df too:
        pooled_df = pooled_df.merge(ancestry_df, how='left', left_on='STUDY ACCESSION', right_on='STUDY ACCESSION')

        # Remove lines without parent mapping: <- there should be report on this...
        pooled_df = pooled_df.loc[~pooled_df['EFO_PARENT'].isna()]
        return pooled_df

