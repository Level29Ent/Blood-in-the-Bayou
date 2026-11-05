# Crash investigation: ground memory and repeated runtime failures

User reports ongoing crashes; exact device trace not supplied. This patch fixes
confirmed ownership and recovery problems, NOT a diagnosis of the user's crash.

1. Expanded6144unit cityrenderGround allocated4608²canvas regardlessLow preset:
   81MiB rawRGBA beforeGPUMipchain(~108MiBwithmips),plusCPUcanvassurface.
   Groundmap/material wasneverdisposed whenbuildCityreplacedworld. Oldcleanup
   disposedonlygeometry. Newworld ground nowgetsownedmap/materialdisposal and
   retiredcanvas shrunkonlyifnot currentcanvas. Sharedmaterials/textures untouched.
2. Groundcanvasbudget2048Low/3072Medium/4096High,cappedrendererGPUmax. GS remains
   exactpixels/world,allmaptiles/locationcoords preserved. LowrawRGBA16MiB(no
   groundmipmaps),not totalGPUorRAMclaim. Farroadtexturemaybesofter;geometry/map/
   saveprogress notremoved. No new universalroom/meshmemorydisposal inthispatch.
3. Mainloop previouslyswallowed repeatedupdate/rendererrorsandkeptretrying forever;
   errorneverreachedwindow.onerror/sessiondiagnostics. Newguardrecordsfirsterror,
   after3sameconsecutivefailures haltsgamework,clearsinput,pausessolo/savesonce,
   showsactualstage/message anddownloadable JSON includingGPUresourcecounts.
   NOauto-reloadorclearstorage.No forcedresumeofunknownfailedsimulation.
   Fatalbrowserprocess/OOMterminationmaypreventanyguardfromrunning.

Testsactualsourcegroundbuilderdisposal/filtersettings,samecurrentcanvasprotection,
GPUsizebudget,safehaltloop/input/saveonce/errorvisibility. Sourceallmapfixture
2048²GS1/3,oldtexturedisposalonce,mipoff,192mapwidth,zoo/mallretained,1roadcomponent.
432Nodechecks passedbeforelastnotice-test;finaltotalinPR. Build/TypeScriptinPR.
No fullSafari/deviceOOM/memoryprofileorlongsessionplaythrough. Testtextureallocation
math is not proofcrashresolved.NativeiOSarchive notrebuilt.
