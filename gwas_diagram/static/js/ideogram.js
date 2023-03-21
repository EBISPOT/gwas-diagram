var annotationTracks = [
   {id: '0', displayName: "Cardiovascular disease", color: "#B33232", shape: 'circle'},
   {id: '1', displayName: "Hematological measurement", color: "#8DD3C7", shape: 'circle'},
   {id: '2', displayName: "Neurological disorder", color: "#FFFFB3", shape: 'circle'},
   {id: '3', displayName: "Biological process", color: "#BEBADA", shape: 'circle'},
   {id: '4', displayName: "Cardiovascular measurement", color: "#80B1D3", shape: 'circle'},
   {id: '5', displayName: "Other trait", color: "#FB8072", shape: 'circle'},
   {id: '6', displayName: "Metabolic disorder", color: "#FDB462", shape: 'circle'},
   {id: '7', displayName: "Response to drug", color: "#FCCDE5", shape: 'circle'},
   {id: '8', displayName: "Lipid or lipoprotein measurement", color: "#B3DE69", shape: 'circle'},
   {id: '9', displayName: "Body measurement", color: "#66CCFF", shape: 'circle'},
   {id: '10', displayName: "Cancer", color: "#BC80BD", shape: 'circle'},
   {id: '11', displayName: "Inflammatory measurement", color: "#CCEBC5", shape: 'circle'},
   {id: '12', displayName: "Immune system disorder", color: "#FFED6F", shape: 'circle'},
   {id: '13', displayName: "Other measurement", color: "#006699", shape: 'circle'},
   {id: '14', displayName: "Liver enzyme measurement", color: "#669900", shape: 'circle'},
   {id: '15', displayName: "Other disease", color: "#FF3399", shape: 'circle'},
   {id: '16', displayName: "Digestive system disorder", color: "#B7704C", shape: 'circle'}
];

//var annotations = {
//  "keys": ["name", "start", "length", "trackIndex"], "annots": [{ "chr": "1", "annots": [["rs1, rs5", 1, 0, 0], ["rs2", 200000, 0, 1], ["rs3", 1, 5, 2], ["rs3", 1, 5, 3]] },
//  { "chr": "2", "annots": [["rs1, rs5", 1, 0, 0], ["rs2", 200000, 0, 1], ["rs3", 1, 5, 2], ["rs3", 1, 5, 3]]}]
//}

async function getResponse() {
	const response = await fetch(
		'http://0.0.0.0:9000/v1/plotting_data?parent_term=Cancer%7CCardiovascular%20measurement%7CBody%20measurement%7CDigestive%20system%20disorder',
		{
			method: 'GET',
		}
	);
  const data = await response.json(); // Extracting data as a JSON Object from the response
  return data;
}

var ideogram;

getResponse().then(data => ideogram = new Ideogram({
  organism: 'human',
  chromosomeScale: 'relative',
  chrWidth: 10,
  chrHeight: 500,
  annotationTracks: annotationTracks.slice(0, 4),
  annotations: data,
  annotationHeight: 5
}), error => console.log(error));

//var annotations = { "keys": ["name", "start", "length", "trackIndex"], "annots": [{ "chr": "1", "annots": [["rs112248193", 3801838, 1, 0], ["rs2128416", 10640391, 1, 0], ["rs11587687", 109605179, 1, 0], ["rs3790612, rs72683442", 112541524, 2, 0], ["rs410895", 196929096, 1, 0], ["rs6427827, rs11577827", 200429259, 2, 0], ["rs919655", 213984629, 1, 0], ["rs12140498", 221925348, 1, 0], ["rs6426584", 227187248, 1, 0]] }, { "chr": "2", "annots": [["rs7594221", 23889854, 1, 0], ["rs116350483", 144581119, 1, 0], ["rs80265589", 168171469, 1, 0], ["rs28416292", 181642743, 1, 0], ["rs58172089", 198052202, 1, 0], ["rs3755152, rs148388367, rs201030469", 215957474, 3, 0], ["rs7564805", 233320300, 1, 0]] }, { "chr": "3", "annots": [["rs34234056", 14376944, 1, 0], ["rs11129176", 25007819, 1, 0], ["rs6775323", 27679594, 1, 0], ["rs62282867", 101253234, 1, 0], ["rs111163508", 129516580, 1, 0], ["rs7430585", 150394254, 1, 0]] }, { "chr": "5", "annots": [["rs115237855, rs78303234", 17186227, 2, 0], ["rs30373", 56449507, 1, 0], ["rs63338061", 72190401, 1, 0], ["rs17421627", 88551768, 1, 0], ["rs62391700", 126757703, 1, 0], ["rs1109114, rs1438692", 149236383, 2, 0], ["rs6875105", 173627914, 1, 0]] }, { "chr": "6", "annots": [["rs2326838", 6901430, 1, 0], ["rs12192672", 7229386, 1, 0], ["rs17507554", 11394054, 1, 0], ["rs6923949", 35528589, 1, 0], ["rs375435", 42693666, 1, 0], ["rs6910414", 56861939, 1, 0], ["rs947340", 76038227, 1, 0], ["rs74526772", 106067343, 1, 0]] }, { "chr": "7", "annots": [["rs9639276", 827396, 1, 0], ["rs12531825", 7965543, 1, 0], ["rs12719025", 51032493, 1, 0], ["rs111963714", 100351032, 1, 0], ["rs34926272", 129951967, 1, 0]] }, { "chr": "8", "annots": [["rs62490856", 10611520, 1, 0], ["rs61675430", 60758512, 1, 0], ["rs13263941, rs376067714", 108109717, 2, 0]] }, { "chr": "14", "annots": [["rs1956524, rs10135971", 68333676, 2, 0], ["rs112145470, rs368205955, rs12147951, rs1972565, rs1972564, rs118186707, rs28488340, rs888413", 73889387, 8, 0], ["rs28468687", 35557136, 1, 0], ["rs1254260", 60369019, 1, 0]] }, { "chr": "15", "annots": [["rs1800407", 27985172, 1, 0], ["rs1648303", 45153494, 1, 0], ["rs10083695", 53694950, 1, 0], ["rs3825991", 89218433, 1, 0], ["rs1372613", 100664630, 1, 0]] }, { "chr": "16", "annots": [["rs7206532", 80456234, 1, 0], ["rs142963458, rs1049868", 84527755, 2, 0]] }, { "chr": "17", "annots": [["rs62064364", 45577102, 1, 0], ["rs4794029", 49202939, 1, 0], ["rs56737642, rs61586425, rs62075724, rs7405453", 81548483, 4, 0]] }, { "chr": "18", "annots": [["rs4800994", 55736619, 1, 0], ["rs1517034, rs17696543", 59270257, 2, 0]] }, { "chr": "9", "annots": [["rs9298817", 21576592, 1, 0], ["rs10781177, rs717299", 73978095, 2, 0]] }, { "chr": "10", "annots": [["rs111245635, rs1947075", 47349521, 2, 0], ["rs7916697", 68232096, 1, 0], ["rs11200922", 84202002, 1, 0], ["rs34309160", 102274793, 1, 0], ["rs17102399, rs60401382", 121676449, 2, 0]] }, { "chr": "11", "annots": [["rs1016934", 31699073, 1, 0], ["rs618838", 66561248, 1, 0], ["rs116233906, rs10737153", 69200804, 2, 0], ["rs12574286", 77226557, 1, 0], ["rs1126809", 89284793, 1, 0], ["rs6483429", 95506623, 1, 0]] }, { "chr": "12", "annots": [["rs2080402", 236009, 1, 0], ["rs3138142", 55721801, 1, 0], ["rs76629482", 95785011, 1, 0]] }, { "chr": "13", "annots": [["rs9796234", 113669682, 1, 0]] }, { "chr": "19", "annots": [["rs76076446", 3771588, 1, 0]] }, { "chr": "20", "annots": [["rs1232603, rs6077977", 10632315, 2, 0]] }, { "chr": "21", "annots": [["rs8132685", 32848308, 1, 0]] }, { "chr": "22", "annots": [["rs5752638", 27792215, 1, 0], ["rs5763593, rs2073946", 29906249, 2, 0], ["rs75159625", 45981128, 1, 0]] }] };


//var ideogram = new Ideogram({
//  organism: 'human',
//  chromosomeScale: 'relative',
//  chrWidth: 10,
//  chrHeight: 500,
//  annotationTracks: annotationTracks.slice(0, 4),
//  annotations: annotations,
//  annotationHeight: 5
//});
