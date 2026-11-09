"""Contrôles UI isolés : aucun compte, aucune copie ni notification réels."""
import asyncio, json, re, subprocess
from pathlib import Path
from playwright.async_api import async_playwright

BASE = "http://127.0.0.1:3000"
OUT = Path("/home/ubuntu/webdev-static-assets/workbench-checks")
OUT.mkdir(parents=True, exist_ok=True)
ROOT=Path(__file__).resolve().parents[1]
def fixture(source):
    return json.loads(subprocess.check_output(["pnpm","exec","tsx","-e",source],cwd=ROOT,text=True))
WORKSHOPS=fixture('import {workshops} from "./shared/simulationWorkshops"; console.log(JSON.stringify(workshops))')
SAMPLES=fixture('import {sampleAnswers} from "./server/workbenchEngine"; console.log(JSON.stringify(sampleAnswers))')
OBJECTIVE_MAX=sum(len(t.get("slots",t.get("fields",[]))) if t["kind"]!="budget" else 1 for w in WORKSHOPS for t in w["tasks"] if t["kind"] not in ["dialogue","writing"])
WORDS = "Je propose une vérification concrète avec la responsable afin de distinguer les contraintes de temps les besoins prioritaires les preuves disponibles et une prochaine étape réversible sans garantie de résultat."

MOUNT = r"""async ({index, runner, consoleMode=false}) => {
  const main = await (await fetch('/src/main.tsx')).text();
  const path = suffix => main.match(new RegExp('"([^"\\n]*' + suffix.replaceAll('.', '\\.') + '[^"\\n]*)"'))[1];
  const React=(await import(path('/react_jsx-dev-runtime.js').replace('react_jsx-dev-runtime','react'))).default;
  const DOM=(await import(path('/react-dom_client.js'))).default;
  const Editor=(await import('/src/components/SimulationActivityEditor.tsx')).default;
  const {workshops}=await import('/@fs/home/ubuntu/gestion-medias-sociaux/shared/simulationWorkshops.ts');
  window.__answer={};
  window.__mounted?.unmount(); document.querySelector('#wb-check')?.remove();
  document.querySelector('#root').style.display='none';
  const host=document.createElement('div');host.id='wb-check';host.style='min-height:100vh;background:#f8fafc';document.body.append(host);
  window.__mounted=DOM.createRoot(host);
  if (!runner) {
    function Fixture(){const[a,setA]=React.useState({});return React.createElement(Editor,{workshop:workshops[index],answer:a,onChange:v=>{window.__answer=v;setA(v)}})}
    window.__mounted.render(React.createElement(Fixture));
  } else {
    const {WorkbenchRunner,AdminSimulationConsole}=await import('/src/components/FormativeSimulation.tsx');
    const {trpc}=await import('/src/lib/trpc.ts');
    const {QueryClient,QueryClientProvider}=await import(path('/@tanstack_react-query.js'));
    const {httpBatchLink}=await import(path('/@trpc_client.js'));
    const superjson=(await import(path('/superjson.js'))).default;
    const queryClient=new QueryClient({defaultOptions:{queries:{retry:false},mutations:{retry:false}}});
    const client=trpc.createClient({links:[httpBatchLink({url:'/api/trpc',transformer:superjson})]});
    const initial={workshops,attempt:null,remainingSeconds:5400,serverNow:Date.now()};
    window.__mounted.render(React.createElement(trpc.Provider,{client,queryClient},React.createElement(QueryClientProvider,{client:queryClient},consoleMode?React.createElement(AdminSimulationConsole):React.createElement(WorkbenchRunner,{initial,test:true}))));
  }
}"""

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path="/usr/bin/chromium", args=["--no-sandbox"])
        page = await browser.new_page(viewport={"width":1440,"height":960})
        errors=[]
        page.on("pageerror", lambda e: errors.append(str(e)))
        async def rpc(route):
            path=route.request.url.split('/api/trpc/')[1].split('?')[0]
            paths=path.split(',')
            responses=[]
            for op in paths:
                if op=='admin.testFormativeWorkshop':
                    body=json.loads(route.request.post_data or '{}')
                    payload=body.get('0',{}).get('json',{})
                    answers=payload.get('answers',{})
                    records={wid:{"answer":answer,"committed":True,"consequence":"Le scénario continue avec un nouvel incident à résoudre."} for wid,answer in answers.items()}
                    value={"workshops":WORKSHOPS,"currentStep":len(answers),"records":records,"metrics":{"budget":600000,"visibility":35,"engagement":3,"prospects":90,"satisfaction":65}}
                elif op=='admin.formativeSimulation':
                    value={"simulation":{"id":1,"title":"Naya V3","isPublished":False,"scheduleCronTaskUid":None},"workshops":WORKSHOPS,"objectiveMax":OBJECTIVE_MAX,"attempts":[]}
                else: value=None
                responses.append({"result":{"data":{"json":value}}})
            await route.fulfill(json=responses)
        await page.route('**/api/trpc/**',rpc)
        await page.goto(BASE)
        await page.wait_for_timeout(900)
        await page.evaluate(MOUNT,{"index":1,"runner":False})
        await page.get_by_role('heading',name='Compléter la logique de segmentation').wait_for()
        # Desktop: actual pointer drag, no synthetic answer injection.
        token=page.get_by_role('button',name='confiance',exact=True)
        await token.scroll_into_view_if_needed()
        slot=page.locator('[data-slot="audience-cloze-a"]').first.locator('button').first
        a=await token.bounding_box(); b=await slot.bounding_box()
        await page.mouse.move(a['x']+15,a['y']+15);await page.mouse.down();await page.mouse.move(b['x']+15,b['y']+15,steps=12);await page.mouse.up()
        await page.wait_for_timeout(100)
        assert (await page.evaluate('window.__answer'))['audience-cloze-a']
        await page.evaluate("window.scrollTo(0,0)")
        await page.screenshot(path=str(OUT/'cloze-desktop.png'),full_page=True)
        # Mobile: select a card, scroll, place; keyboard alternative stays available.
        await page.set_viewport_size({"width":390,"height":844})
        await page.get_by_role('button',name='besoin',exact=True).click()
        await slot.click()
        await page.wait_for_timeout(80)
        assert 'audience-cloze-a' in await page.evaluate('window.__answer')
        assert await page.evaluate('document.documentElement.scrollWidth <= innerWidth')
        assert await page.evaluate('[...document.querySelectorAll("#wb-check article")].every(e=>e.getBoundingClientRect().right <= innerWidth+1)')
        await page.evaluate("window.scrollTo(0,0)")
        await page.screenshot(path=str(OUT/'cloze-mobile.png'),full_page=True)
        # Dialogues: no click-only answer; 4 written exchanges and editable earlier reply.
        await page.evaluate(MOUNT,{"index":6,"runner":False})
        for i in range(4):
            area=page.locator('textarea').filter(visible=True).first
            await area.fill(WORDS)
            await page.get_by_role('button',name='Envoyer le tour',exact=True).click()
        assert sum(1 for k,v in (await page.evaluate('window.__answer')).items() if k.startswith('_sent:') and v=='1')==4
        await page.get_by_role('button',name='Modifier ma réponse',exact=True).first.click()
        await page.locator('textarea').first.fill(WORDS+' Je précise le délai.')
        await page.get_by_role('button',name='Envoyer le tour',exact=True).click()
        await page.evaluate("window.scrollTo(0,0)")
        await page.screenshot(path=str(OUT/'dialogue-mobile.png'),full_page=True)
        # Budget sum is live and accepts alternate feasible allocations.
        await page.evaluate(MOUNT,{"index":3,"runner":False})
        for label,value in [('Production','100000'),('Diffusion','200000'),('Mesure','100000'),('Relation','100000'),('Accessibilité','50000'),('Réserve d’apprentissage','50000')]:
            await page.get_by_role('spinbutton',name=label,exact=True).fill(value)
        assert '600' in await page.get_by_text('Total engagé en direct').locator('..').inner_text()
        # Full admin runner: enters without starting, then starts on first answer.
        await page.set_viewport_size({"width":1440,"height":960})
        await page.evaluate(MOUNT,{"index":0,"runner":True})
        await page.get_by_role('button',name='Entrer dans le test complet',exact=True).click()
        assert await page.get_by_role('timer').inner_text()=='01:30:00'
        await page.wait_for_timeout(1200)
        assert await page.get_by_role('timer').inner_text()=='01:30:00'
        await page.locator('input').first.fill('1686')
        await page.wait_for_timeout(1500)
        assert await page.get_by_role('timer').inner_text()<'01:30:00'
        await page.get_by_role('button',name='Valider l’atelier et découvrir la suite',exact=True).click()
        await page.get_by_role('alert').wait_for()
        await page.evaluate("window.scrollTo(0,0)")
        await page.screenshot(path=str(OUT/'runner-desktop.png'),full_page=True)
        await page.set_viewport_size({"width":390,"height":844})
        assert await page.evaluate('document.documentElement.scrollWidth <= innerWidth')
        assert await page.evaluate('[...document.querySelectorAll("#wb-check article")].every(e=>e.getBoundingClientRect().right <= innerWidth+1)')
        await page.evaluate("window.scrollTo(0,0)")
        await page.screenshot(path=str(OUT/'runner-mobile.png'),full_page=True)
        # Complete real DOM inputs and verify commit moves to atelier 2 without resetting the timer.
        await page.set_viewport_size({"width":1440,"height":960})
        answer=SAMPLES[WORKSHOPS[0]["id"]]
        for task in WORKSHOPS[0]["tasks"]:
            if task["kind"]=="placement":
                for slot_data in task["slots"]:
                    token_data=next(t for t in task["tokens"] if t["id"]==answer[slot_data["id"]])
                    await page.get_by_role('button',name=token_data["label"],exact=True).click()
                    await page.locator('[data-slot="'+slot_data["id"]+'"]').first.locator('button').first.first.click()
            elif task["kind"]=="numeric":
                for field in task["fields"]:await page.get_by_role('spinbutton',name=field["label"],exact=True).fill(answer[field["id"]])
            elif task["kind"]=="writing":
                for field in task["fields"]:await page.get_by_label(field["label"],exact=False).fill(answer[field["id"]])
        before=await page.get_by_role('timer').inner_text()
        await page.get_by_role('button',name='Valider l’atelier et découvrir la suite',exact=True).click()
        await page.get_by_role('button',name='Poursuivre la mission',exact=True).click()
        await page.get_by_role('heading',name='Segmenter sans fabriquer de persona',exact=True).wait_for()
        assert await page.get_by_role('timer').inner_text()<=before
        await page.get_by_role('button',name='Remettre une copie incomplète',exact=True).click()
        await page.get_by_role('button',name='Terminer sans envoi',exact=True).click()
        await page.get_by_role('heading',name='Test clôturé — aucune remise réelle',exact=True).wait_for()
        finaltime=await page.get_by_role('timer').inner_text();await page.wait_for_timeout(1200)
        assert await page.get_by_role('timer').inner_text()==finaltime
        await page.evaluate(MOUNT,{"index":0,"runner":True,"consoleMode":True})
        await page.get_by_role('button',name='Inspecter directement un atelier',exact=True).click()
        await page.get_by_label('Atelier à inspecter',exact=True).select_option('6')
        await page.get_by_role('heading',name='Conduire une conversation de qualification',exact=True).wait_for()
        await page.get_by_role('button',name='Tester toute l’épreuve comme une apprenante',exact=True).click()
        await page.get_by_role('button',name='Entrer dans le test complet',exact=True).wait_for()
        await page.set_viewport_size({"width":390,"height":844})
        assert await page.evaluate('document.documentElement.scrollWidth <= innerWidth')
        await page.evaluate("window.scrollTo(0,0)")
        await page.screenshot(path=str(OUT/'admin-mobile.png'),full_page=True)
        assert not errors,errors
        print(json.dumps({"desktopDrag":"ok","mobileTapPlacement":"ok","dialogueFourTurnsAndEdit":"ok","budgetLive":"ok","timerFirstAnswer":"ok","incompleteCommitRejected":"ok","responsive390":"ok","adminConsoleAndDirectExplorer":"ok","pageErrors":errors,"screenshots":str(OUT)},ensure_ascii=False))
        await browser.close()

if __name__=='__main__':asyncio.run(main())
